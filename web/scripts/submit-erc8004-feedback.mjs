#!/usr/bin/env node
/**
 * Submit positive ERC-8004 reputation feedback for OnFRA (agent #9219) on Celo.
 *
 * Usage (from web/):
 *   npm run feedback:erc8004
 *
 * Env (web/.env):
 *   REPORTER_PRIVATE_KEY=0x...
 *   CELO_RPC_URL=https://forno.celo.org  (optional)
 *
 * Optional overrides:
 *   FEEDBACK_SCORE=95
 *   FEEDBACK_TAG=starred
 *   AGENT_ID=9219
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createPublicClient,
  createWalletClient,
  http,
  keccak256,
  toBytes
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");

const REPUTATION_REGISTRY = "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63";
const IDENTITY_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const DEFAULT_AGENT_ID = 9219;
const APP_BASE_URL = "https://wallet-profile-orpin.vercel.app";

const reputationRegistryAbi = [
  {
    type: "function",
    name: "giveFeedback",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "value", type: "int128" },
      { name: "valueDecimals", type: "uint8" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" },
      { name: "endpoint", type: "string" },
      { name: "feedbackURI", type: "string" },
      { name: "feedbackHash", type: "bytes32" }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "getSummary",
    stateMutability: "view",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "clientAddresses", type: "address[]" },
      { name: "tag1", type: "string" },
      { name: "tag2", type: "string" }
    ],
    outputs: [
      { name: "count", type: "uint64" },
      { name: "summaryValue", type: "int128" },
      { name: "summaryValueDecimals", type: "uint8" }
    ]
  }
];

const identityRegistryAbi = [
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }]
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
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function buildFeedbackPayload(agentId, score) {
  return {
    type: "https://eips.ethereum.org/EIPS/eip-8004#feedback-v1",
    agentId,
    rating: score,
    tag: "starred",
    comment:
      "OnFRA provides accurate Celo wallet financial health analysis, clear loan capacity guidance, and lender-ready explanations. Reliable agent APIs and well-structured ERC-8004 discovery metadata.",
    reviewer: "Wallet Analyst",
    servicesUsed: ["analyze_wallet", "chat_query", "generate_report", "verify_report"],
    platform: APP_BASE_URL,
    reviewedAt: new Date().toISOString().slice(0, 10)
  };
}

async function main() {
  loadEnvFile();

  const privateKey = process.env.REPORTER_PRIVATE_KEY?.trim();
  const rpcUrl = process.env.CELO_RPC_URL?.trim() || "https://forno.celo.org";
  const agentId = BigInt(process.env.AGENT_ID || String(DEFAULT_AGENT_ID));
  const score = Number(process.env.FEEDBACK_SCORE || "95");
  const tag1 = process.env.FEEDBACK_TAG || "starred";

  if (!privateKey) {
    console.error("REPORTER_PRIVATE_KEY is required in web/.env");
    process.exit(1);
  }

  if (!Number.isInteger(score) || score < 0 || score > 100) {
    console.error("FEEDBACK_SCORE must be an integer between 0 and 100 for starred feedback.");
    process.exit(1);
  }

  const normalizedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(normalizedKey);

  const publicClient = createPublicClient({
    chain: celo,
    transport: http(rpcUrl)
  });

  const walletClient = createWalletClient({
    account,
    chain: celo,
    transport: http(rpcUrl)
  });

  const agentOwner = await publicClient.readContract({
    address: IDENTITY_REGISTRY,
    abi: identityRegistryAbi,
    functionName: "ownerOf",
    args: [agentId]
  });

  if (agentOwner.toLowerCase() === account.address.toLowerCase()) {
    console.error(
      "Self-feedback is blocked by ERC-8004. REPORTER_PRIVATE_KEY must not be the agent owner wallet."
    );
    console.error(`Agent owner: ${agentOwner}`);
    console.error(`Reporter:    ${account.address}`);
    process.exit(1);
  }

  const feedbackJson = JSON.stringify(buildFeedbackPayload(Number(agentId), score), null, 2);
  const feedbackURI = `data:application/json;charset=utf-8,${encodeURIComponent(feedbackJson)}`;
  const feedbackHash = keccak256(toBytes(feedbackJson));
  const endpoint = `${APP_BASE_URL}/api/agent/analyze`;

  console.log("Submitting ERC-8004 reputation feedback");
  console.log(`Chain:      Celo mainnet (${celo.id})`);
  console.log(`Registry:   ${REPUTATION_REGISTRY}`);
  console.log(`Agent ID:   ${agentId}`);
  console.log(`Reporter:   ${account.address}`);
  console.log(`Agent owner:${agentOwner}`);
  console.log(`Tag:        ${tag1}`);
  console.log(`Score:      ${score}/100`);
  console.log(`Endpoint:   ${endpoint}`);

  const hash = await walletClient.writeContract({
    address: REPUTATION_REGISTRY,
    abi: reputationRegistryAbi,
    functionName: "giveFeedback",
    args: [agentId, score, 0, tag1, "", endpoint, feedbackURI, feedbackHash]
  });

  console.log(`Transaction submitted: ${hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Confirmed in block ${receipt.blockNumber} (status: ${receipt.status})`);

  const summary = await publicClient.readContract({
    address: REPUTATION_REGISTRY,
    abi: reputationRegistryAbi,
    functionName: "getSummary",
    args: [agentId, [account.address], tag1, ""]
  });

  console.log(
    `Your "${tag1}" summary: count=${summary[0]}, total=${summary[1]}, decimals=${summary[2]}`
  );
  console.log(`View on Celoscan: https://celoscan.io/tx/${hash}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
