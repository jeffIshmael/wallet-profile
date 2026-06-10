#!/usr/bin/env node
/**
 * Update OnFRA metadata URI on the ERC-8004 Identity Registry (Celo).
 *
 * Usage:
 *   cd erc8004-agent && npm run set-uri
 *
 * Env vars (or erc8004-agent/.env):
 *   AGENT_IPFS_URI=ipfs://...   (required)
 *   AGENT_ID=9219                 (required for existing agents)
 *   PRIVATE_KEY=0x...             (must be agent owner)
 *   RPC_URL=https://forno.celo.org
 *   CHAIN_ID=42220
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo, celoSepolia } from "viem/chains";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnvFile() {
  const envPath = join(__dirname, "..", ".env");
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

loadEnvFile();

const IDENTITY_REGISTRY_MAINNET = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432";
const IDENTITY_REGISTRY_SEPOLIA = "0x8004A818BFB912233c491871b3d84c89A494BD9e";

const identityRegistryAbi = [
  {
    type: "function",
    name: "setAgentURI",
    stateMutability: "nonpayable",
    inputs: [
      { name: "agentId", type: "uint256" },
      { name: "newURI", type: "string" }
    ],
    outputs: []
  }
];

async function main() {
  const agentUri = process.env.AGENT_IPFS_URI;
  const agentId = Number(process.env.AGENT_ID || "9219");
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL || "https://forno.celo.org";
  const chainId = Number(process.env.CHAIN_ID || "42220");

  if (!agentUri?.startsWith("ipfs://") && !agentUri?.startsWith("data:")) {
    console.error("AGENT_IPFS_URI must be content-addressed (ipfs:// or data:).");
    process.exit(1);
  }

  if (!privateKey) {
    console.error("PRIVATE_KEY is required.");
    process.exit(1);
  }

  if (!Number.isInteger(agentId) || agentId <= 0) {
    console.error("AGENT_ID must be a positive integer.");
    process.exit(1);
  }

  const chain = chainId === celoSepolia.id ? celoSepolia : celo;
  const registry =
    chain.id === celoSepolia.id ? IDENTITY_REGISTRY_SEPOLIA : IDENTITY_REGISTRY_MAINNET;

  const account = privateKeyToAccount(
    privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`
  );

  const client = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl)
  });

  console.log(`Updating agent URI on ${chain.name} (${chain.id})`);
  console.log(`Registry: ${registry}`);
  console.log(`Agent ID: ${agentId}`);
  console.log(`New URI: ${agentUri}`);
  console.log(`Owner: ${account.address}`);

  const hash = await client.writeContract({
    address: registry,
    abi: identityRegistryAbi,
    functionName: "setAgentURI",
    args: [BigInt(agentId), agentUri]
  });

  console.log(`Transaction submitted: ${hash}`);
  console.log(`View on Celoscan: https://celoscan.io/tx/${hash}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
