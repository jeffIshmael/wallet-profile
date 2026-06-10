#!/usr/bin/env node
/**
 * Register OnFRA on the ERC-8004 Identity Registry (Celo).
 *
 * Usage (from repo root or erc8004-agent/):
 *   cd erc8004-agent && npm install && npm run register
 *
 * Env vars (or set in erc8004-agent/.env):
 *   AGENT_IPFS_URI=ipfs://...   (required, content-addressed)
 *   PRIVATE_KEY=0x...           (required)
 *   RPC_URL=https://forno.celo.org  (optional)
 *   CHAIN_ID=42220              (42220 mainnet, 11142220 Sepolia)
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
    name: "register",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }]
  }
];

async function main() {
  const agentUri = process.env.AGENT_IPFS_URI;
  const privateKey = process.env.PRIVATE_KEY;
  const rpcUrl = process.env.RPC_URL || "https://forno.celo.org";
  const chainId = Number(process.env.CHAIN_ID || "42220");

  if (!agentUri?.startsWith("ipfs://") && !agentUri?.startsWith("data:")) {
    console.error("AGENT_IPFS_URI must be content-addressed (ipfs:// or data:).");
    console.error("Pin web/public/.well-known/agent.json to IPFS first.");
    process.exit(1);
  }

  if (!privateKey) {
    console.error("PRIVATE_KEY is required (set in erc8004-agent/.env or environment).");
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

  console.log(`Registering agent on ${chain.name} (${chain.id})`);
  console.log(`Registry: ${registry}`);
  console.log(`Agent URI: ${agentUri}`);
  console.log(`Owner: ${account.address}`);

  const hash = await client.writeContract({
    address: registry,
    abi: identityRegistryAbi,
    functionName: "register",
    args: [agentUri]
  });

  console.log(`Transaction submitted: ${hash}`);
  console.log("Check 8004scan or Celoscan for agentId after confirmation.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
