#!/usr/bin/env node
/**
 * Pin web/public/.well-known/agent.json to IPFS (Pinata).
 *
 * Usage:
 *   cd contracts/erc8004-agent && npm run pin-agent-json
 *
 * Env (from contracts/erc8004-agent/.env or ../../web/.env):
 *   PINATA_JWT — required
 */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..", "..", "..");
const AGENT_JSON_PATH = join(REPO_ROOT, "web", "public", ".well-known", "agent.json");

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split("\n")) {
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

loadEnvFile(join(__dirname, "..", ".env"));
loadEnvFile(join(REPO_ROOT, "web", ".env"));

async function main() {
  const pinataJwt = process.env.PINATA_JWT?.trim();
  if (!pinataJwt) {
    console.error("PINATA_JWT is required (set in web/.env or erc8004-agent/.env).");
    process.exit(1);
  }

  if (!existsSync(AGENT_JSON_PATH)) {
    console.error(`agent.json not found at ${AGENT_JSON_PATH}`);
    process.exit(1);
  }

  const agentJson = JSON.parse(readFileSync(AGENT_JSON_PATH, "utf8"));
  const appUrl = "https://app.onfra.xyz";

  // Ensure canonical production URLs before pinning.
  agentJson.homepage = appUrl;
  agentJson.image = `${appUrl}/agent_logo.png`;
  if (typeof agentJson.description === "string" && !agentJson.description.includes(appUrl)) {
    agentJson.description = agentJson.description.replace(
      /https?:\/\/[^\s]+/g,
      appUrl
    );
  }
  for (const service of agentJson.services ?? []) {
    if (service.name === "WEB") service.endpoint = `${appUrl}/`;
    if (service.name === "A2A") service.endpoint = `${appUrl}/.well-known/agent-card.json`;
    if (service.name === "MCP") service.endpoint = `${appUrl}/.well-known/mcp.json`;
  }

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pinataJwt}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      pinataContent: agentJson,
      pinataMetadata: { name: "onfra-agent-registration-v1" },
      pinataOptions: { cidVersion: 1 }
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Pinata upload failed (${response.status}): ${text}`);
    process.exit(1);
  }

  const result = await response.json();
  const ipfsUri = `ipfs://${result.IpfsHash}`;

  console.log("Pinned agent.json to IPFS:");
  console.log(`  CID: ${result.IpfsHash}`);
  console.log(`  URI: ${ipfsUri}`);
  console.log("");
  console.log("Next — update onchain agentURI (agent owner key required):");
  console.log(`  AGENT_IPFS_URI=${ipfsUri} AGENT_ID=9219 PRIVATE_KEY=0x... npm run set-uri`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
