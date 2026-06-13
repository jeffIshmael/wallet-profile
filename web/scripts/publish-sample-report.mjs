#!/usr/bin/env node
/**
 * Publish the demo sample report attestation on Celo (OnchainReporter proxy).
 *
 * Usage (from web/):
 *   node scripts/publish-sample-report.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");

const PROXY = process.env.ONCHAIN_REPORTER_PROXY_ADDRESS?.trim() || "0xE7621aF5dE3806ba26115bdC89190c65ed835C21";
const SAMPLE_WALLET = "0xe3B6DE2bAc405cd0106C063e3215f641F7C6A057";
const SAMPLE_REPORT_ID = "REP-SAMPLE0001";
const SAMPLE_IPFS_CID = "bafybei7sample0001chainalysefinancialpassport";

const abi = [
  {
    type: "function",
    name: "publishFinancialReport",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "buyer", type: "address" },
      { name: "reputationScore", type: "uint8" },
      { name: "financialHealthScore", type: "uint8" },
      { name: "loanCapacity", type: "string" },
      { name: "reportId", type: "string" },
      { name: "reportHash", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "verifyReport",
    inputs: [{ name: "reportId", type: "string" }],
    outputs: [
      { name: "exists", type: "bool" },
      {
        name: "attestation",
        type: "tuple",
        components: [
          { name: "wallet", type: "address" },
          { name: "buyer", type: "address" },
          { name: "reputationScore", type: "uint8" },
          { name: "financialHealthScore", type: "uint8" },
          { name: "loanCapacity", type: "string" },
          { name: "reportHash", type: "string" },
          { name: "publishedAt", type: "uint256" }
        ]
      }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "reportCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view"
  }
];

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

async function main() {
  loadEnvFile();

  const privateKey = process.env.REPORTER_PRIVATE_KEY?.trim();
  const rpcUrl = process.env.CELO_RPC_URL?.trim() || "https://forno.celo.org";
  if (!privateKey) {
    console.error("REPORTER_PRIVATE_KEY is required in web/.env");
    process.exit(1);
  }

  const normalizedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(normalizedKey);
  const publicClient = createPublicClient({ chain: celo, transport: http(rpcUrl) });
  const walletClient = createWalletClient({ account, chain: celo, transport: http(rpcUrl) });

  const existing = await publicClient.readContract({
    address: PROXY,
    abi,
    functionName: "verifyReport",
    args: [SAMPLE_REPORT_ID]
  });

  if (existing[0]) {
    console.log(`Sample report ${SAMPLE_REPORT_ID} is already published onchain.`);
    console.log(JSON.stringify(existing[1], (_, v) => (typeof v === "bigint" ? v.toString() : v), 2));
    return;
  }

  console.log(`Publishing sample report ${SAMPLE_REPORT_ID} to ${PROXY} on Celo...`);

  const hash = await walletClient.writeContract({
    address: PROXY,
    abi,
    functionName: "publishFinancialReport",
    args: [
      SAMPLE_WALLET,
      account.address,
      92,
      89,
      "$1,800 - $2,400 USD",
      SAMPLE_REPORT_ID,
      SAMPLE_IPFS_CID
    ]
  });

  console.log(`Transaction: ${hash}`);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Confirmed in block ${receipt.blockNumber} (status: ${receipt.status})`);

  const count = await publicClient.readContract({ address: PROXY, abi, functionName: "reportCount" });
  console.log(`reportCount: ${count}`);
  console.log(`Verify at: http://localhost:3000/verify with code ${SAMPLE_REPORT_ID}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
