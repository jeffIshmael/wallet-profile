#!/usr/bin/env node
/**
 * Send the full USDT balance from the reporter wallet to a recipient on Celo.
 *
 * Usage (from web/):
 *   node scripts/send-reporter-usdt.mjs
 *   node scripts/send-reporter-usdt.mjs 0xRecipient...
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  erc20Abi,
  formatEther,
  formatUnits,
  http,
  parseEther
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");

const USDT_CELO_MAINNET = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e";
const DEFAULT_RECIPIENT = "0x4821ced48Fb4456055c86E42587f61c1F39c6315";

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

/**
 * Transfer the reporter wallet's entire USDT balance to `recipient`.
 * Signs with REPORTER_PRIVATE_KEY; reporter address is derived from that key
 * (or validated against REPORTER_ADDRESS when set).
 */
export async function sendReporterUsdtBalance(recipient = DEFAULT_RECIPIENT) {
  const privateKey = process.env.REPORTER_PRIVATE_KEY?.trim();
  const rpcUrl = process.env.CELO_RPC_URL?.trim() || "https://forno.celo.org";

  if (!privateKey) {
    throw new Error("REPORTER_PRIVATE_KEY is required in web/.env");
  }

  const normalizedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(normalizedKey);

  const reporterAddress = process.env.REPORTER_ADDRESS?.trim();
  if (reporterAddress && reporterAddress.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error(
      `REPORTER_ADDRESS (${reporterAddress}) does not match REPORTER_PRIVATE_KEY (${account.address})`
    );
  }

  const publicClient = createPublicClient({ chain: celo, transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: celo,
    transport: http(rpcUrl)
  });

  const balance = await publicClient.readContract({
    address: USDT_CELO_MAINNET,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [account.address]
  });

  if (balance === 0n) {
    console.log(`Reporter ${account.address} has 0 USDT — nothing to send.`);
    return null;
  }

  const humanBalance = formatUnits(balance, 6);
  console.log(`Reporter:  ${account.address}`);
  console.log(`Recipient: ${recipient}`);
  console.log(`Balance:   ${humanBalance} USDT`);

  const hash = await walletClient.writeContract({
    address: USDT_CELO_MAINNET,
    abi: erc20Abi,
    functionName: "transfer",
    args: [recipient, balance]
  });

  console.log(`Transaction: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Confirmed in block ${receipt.blockNumber} (status: ${receipt.status})`);
  console.log(`Sent ${humanBalance} USDT to ${recipient}`);

  return hash;
}

/**
 * Send native CELO from the reporter wallet to `recipient`.
 * Signs with REPORTER_PRIVATE_KEY; reporter address is derived from that key
 * (or validated against REPORTER_ADDRESS when set).
 */
export async function sendReporterCelo(amount = "0.3", recipient = DEFAULT_RECIPIENT) {
  const privateKey = process.env.REPORTER_PRIVATE_KEY?.trim();
  const rpcUrl = process.env.CELO_RPC_URL?.trim() || "https://forno.celo.org";

  if (!privateKey) {
    throw new Error("REPORTER_PRIVATE_KEY is required in web/.env");
  }

  const normalizedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(normalizedKey);

  const reporterAddress = process.env.REPORTER_ADDRESS?.trim();
  if (reporterAddress && reporterAddress.toLowerCase() !== account.address.toLowerCase()) {
    throw new Error(
      `REPORTER_ADDRESS (${reporterAddress}) does not match REPORTER_PRIVATE_KEY (${account.address})`
    );
  }

  const publicClient = createPublicClient({ chain: celo, transport: http(rpcUrl) });
  const walletClient = createWalletClient({
    account,
    chain: celo,
    transport: http(rpcUrl)
  });

  const value = parseEther(amount);
  const balance = await publicClient.getBalance({ address: account.address });

  if (balance < value) {
    throw new Error(
      `Insufficient CELO: reporter has ${formatEther(balance)} CELO, need ${amount} CELO`
    );
  }

  console.log(`Reporter:  ${account.address}`);
  console.log(`Recipient: ${recipient}`);
  console.log(`Amount:    ${amount} CELO`);
  console.log(`Balance:   ${formatEther(balance)} CELO`);

  const hash = await walletClient.sendTransaction({
    to: recipient,
    value
  });

  console.log(`Transaction: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Confirmed in block ${receipt.blockNumber} (status: ${receipt.status})`);
  console.log(`Sent ${amount} CELO to ${recipient}`);

  return hash;
}

async function main() {
  loadEnvFile();
  const arg = process.argv[2]?.trim();
  if (arg?.toLowerCase() === "celo") {
    const recipient = process.argv[3]?.trim() || DEFAULT_RECIPIENT;
    await sendReporterCelo("0.3", recipient);
    return;
  }
  const recipient = arg || DEFAULT_RECIPIENT;
  await sendReporterUsdtBalance(recipient);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
