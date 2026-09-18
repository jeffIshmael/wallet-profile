#!/usr/bin/env node
/**
 * Seed real OnFRA USDT payments (tagged) + optional API calls on Celo mainnet.
 *
 * Usage (from web/):
 *   npm run seed:txs
 *   SEED_COUNT=3 SEED_ENDPOINTS=analyze,screen npm run seed:txs
 *
 * Pays from REPORTER_PRIVATE_KEY (or AGENT_PRIVATE_KEY / PAYER_PRIVATE_KEY) to
 * NEXT_PUBLIC_X402_PAY_TO using a direct USDT transfer with ERC-8021 attribution
 * suffix, then calls the live API with X-MINIPAY-TX proof.
 *
 * Does not print private keys. Writes tx hashes to ../scratch/onfra_seed_txs.json
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  encodeFunctionData,
  concat,
  erc20Abi,
  formatUnits,
  http,
  parseUnits
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { toDataSuffix } from "@celo/attribution-tags";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const repoRoot = join(webRoot, "..");

const USDT = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e";
const DEFAULT_PAY_TO = "0x4821ced48Fb4456055c86E42587f61c1F39c6315";
const DEFAULT_API = "https://app.onfra.xyz";
const SAMPLE_WALLET = "0x4821ced48Fb4456055c86E42587f61c1F39c6315";

function loadEnvFile() {
  const envPath = join(webRoot, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function pickPayerKey() {
  return (
    process.env.PAYER_PRIVATE_KEY?.trim() ||
    process.env.AGENT_PRIVATE_KEY?.trim() ||
    process.env.CELO_PRIVATE_KEY?.trim() ||
    process.env.REPORTER_PRIVATE_KEY?.trim()
  );
}

async function payUsdtTagged({ walletClient, publicClient, account, payTo, amountUsdt, tag }) {
  const amount = parseUnits(amountUsdt, 6);
  const transferData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [payTo, amount]
  });
  const data = concat([transferData, toDataSuffix(tag)]);
  const hash = await walletClient.sendTransaction({
    account,
    to: USDT,
    data,
    type: "legacy"
  });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

async function callPaid(apiBase, path, body, payer, txHash) {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-MINIPAY-TX": txHash,
      "X-PAYMENT-CALLER": payer
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    // ignore
  }
  return { status: res.status, json, text: text.slice(0, 400) };
}

async function main() {
  loadEnvFile();

  const privateKeyRaw = pickPayerKey();
  if (!privateKeyRaw) {
    console.error("Need PAYER_PRIVATE_KEY, AGENT_PRIVATE_KEY, or REPORTER_PRIVATE_KEY in web/.env");
    process.exit(1);
  }

  const privateKey = privateKeyRaw.startsWith("0x") ? privateKeyRaw : `0x${privateKeyRaw}`;
  const account = privateKeyToAccount(privateKey);
  const rpcUrl = process.env.CELO_RPC_URL?.trim() || "https://forno.celo.org";
  const payTo = (process.env.NEXT_PUBLIC_X402_PAY_TO?.trim() || DEFAULT_PAY_TO);
  const apiBase = (process.env.ONFRA_API_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || DEFAULT_API).replace(/\/$/, "");
  const tag = process.env.NEXT_PUBLIC_ATTRIBUTION_TAG?.trim() || "celo_7a9925848ab1";
  const count = Math.max(1, Math.min(Number(process.env.SEED_COUNT || "5"), 10));
  const endpoints = (process.env.SEED_ENDPOINTS || "analyze,screen")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const targetWallet = process.env.SEED_WALLET?.trim() || SAMPLE_WALLET;

  const publicClient = createPublicClient({ chain: celo, transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: celo,
    transport: http(rpcUrl)
  });

  const usdtBal = await publicClient.readContract({
    address: USDT,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address]
  });
  const celoBal = await publicClient.getBalance({ address: account.address });

  console.log("payer", account.address);
  console.log("payTo", payTo);
  console.log("api", apiBase);
  console.log("tag", tag);
  console.log("USDT", formatUnits(usdtBal, 6));
  console.log("CELO", formatUnits(celoBal, 18));
  console.log("plan", { count, endpoints, targetWallet });

  const price = "0.01";
  const needed = parseUnits(String(Number(price) * count), 6);
  if (usdtBal < needed) {
    console.error(
      `Insufficient USDT: need ~${formatUnits(needed, 6)} for ${count} x ${price}, have ${formatUnits(usdtBal, 6)}`
    );
    process.exit(1);
  }

  const results = [];
  for (let i = 0; i < count; i++) {
    const endpoint = endpoints[i % endpoints.length];
    const path =
      endpoint === "screen"
        ? "/api/lender/screen"
        : endpoint === "chat"
          ? "/api/agent/chat"
          : "/api/agent/analyze";

    console.log(`\n[${i + 1}/${count}] paying ${price} USDT then ${path}`);
    const txHash = await payUsdtTagged({
      walletClient,
      publicClient,
      account,
      payTo,
      amountUsdt: price,
      tag
    });
    console.log("  payment tx", txHash);

    const body =
      endpoint === "chat"
        ? {
            message: `What is the reputation of ${targetWallet}?`,
            walletAddress: targetWallet
          }
        : { walletAddress: targetWallet, force: i === 0 };

    const api = await callPaid(apiBase, path, body, account.address, txHash);
    console.log("  api status", api.status);
    if (api.json?.code) console.log("  api code", api.json.code);
    if (api.json?.status) console.log("  api result status", api.json.status);
    if (api.json?.trust) console.log("  trust", api.json.trust);
    if (api.status >= 400) console.log("  body", api.text);

    results.push({
      i: i + 1,
      endpoint,
      path,
      paymentTx: txHash,
      paymentExplorer: `https://celoscan.io/tx/${txHash}`,
      apiStatus: api.status,
      apiSnippet: api.text
    });
  }

  const outDir = join(repoRoot, "scratch");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "onfra_seed_txs.json");
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        seededAt: new Date().toISOString(),
        payer: account.address,
        payTo,
        attributionTag: tag,
        apiBase,
        results
      },
      null,
      2
    )
  );
  console.log("\nWrote", outPath);
  console.log("Payment explorers:");
  for (const r of results) console.log("-", r.paymentExplorer);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
