#!/usr/bin/env node
/**
 * Register OnFRA on the ERC-8004 Identity Registry (Celo).
 *
 * Usage:
 *   AGENT_IPFS_URI=ipfs://Qm... PRIVATE_KEY=0x... node erc8004-agent/scripts/register.mjs
 *
 * Optional:
 *   RPC_URL=https://forno.celo.org  (default)
 *   CHAIN_ID=42220                  (42220 mainnet, 11142220 Sepolia)
 */

import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo, celoSepolia } from "viem/chains";

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
] ;

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
    console.error("PRIVATE_KEY is required.");
    process.exit(1);
  }

  const chain = chainId === celoSepolia.id ? celoSepolia : celo;
  const registry =
    chain.id === celoSepolia.id ? IDENTITY_REGISTRY_SEPOLIA : IDENTITY_REGISTRY_MAINNET;

  const account = privateKeyToAccount(privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`);

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
