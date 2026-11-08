#!/usr/bin/env node
// Test script for OnFRA Intelligence Tools and Celo connectivity
// Run: node scripts/test-agent.mjs [wallet] [txHash]

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const agentDist = path.join(__dirname, "..", "web", "src", "lib", "agent", "onfra-dist");

const wallet = process.argv[2] ?? "0x4821ced48fb4456055c86e42587f61c1f39c6315";
const txHash = process.argv[3] ?? "0x16b72ba76249e227c80bf25bacb34e327c327c60c663db436d70b700c908d35e";

console.log("\n========================================================");
console.log("             OnFRA Agent Smoke & Sanity Tests           ");
console.log("========================================================");
console.log(`Target Wallet: ${wallet}`);
console.log(`Target TxHash: ${txHash}\n`);

async function run() {
  let intelRunner;
  try {
    intelRunner = await import(path.join(agentDist, "intel_runner.js"));
  } catch (err) {
    console.error("❌ Failed to load bundled intel_runner.js:", err.message);
    console.error("Please run `npm run build:agent --prefix web` first.");
    process.exit(1);
  }

  const { runIntelTool, validateIntelInput } = intelRunner;

  const testCases = [
    {
      name: "analyze_wallet",
      args: { wallet_address: wallet, chain: "celo", period: "30d" }
    },
    {
      name: "get_cash_flow_summary",
      args: { wallet_address: wallet, chain: "celo", period: "30d" }
    },
    {
      name: "get_token_balances",
      args: { wallet_address: wallet, chain: "celo" }
    },
    {
      name: "get_token_breakdown",
      args: { wallet_address: wallet, chain: "celo", period: "30d", metric: "volume" }
    },
    {
      name: "compare_periods",
      args: { wallet_address: wallet, chain: "celo", current_period: "7d", previous_period: "30d" }
    },
    {
      name: "get_spending_breakdown",
      args: { wallet_address: wallet, chain: "celo", period: "30d" }
    },
    {
      name: "get_dominant_counterparties",
      args: { wallet_address: wallet, chain: "celo", period: "30d" }
    },
    {
      name: "get_wallet_activity",
      args: { wallet_address: wallet, chain: "celo", period: "7d" }
    },
    {
      name: "explain_transaction",
      args: { transaction_hash: txHash, chain: "celo", use_trace: false }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    const start = Date.now();
    try {
      // Validate input first
      const check = validateIntelInput(tc.name, tc.args);
      if (!check.ok) {
        throw new Error(`Validation failed: ${check.message}`);
      }

      // Execute tool
      const result = await runIntelTool(tc.name, tc.args);
      const ms = Date.now() - start;
      const keys = Object.keys(result).slice(0, 4).join(", ");
      console.log(`✅ [PASS] ${tc.name.padEnd(28)} (${ms}ms) -> fields: [${keys}]`);
      passed++;
    } catch (e) {
      const ms = Date.now() - start;
      console.error(`❌ [FAIL] ${tc.name.padEnd(28)} (${ms}ms) -> Error: ${e.message}`);
      failed++;
    }
  }

  console.log("\n========================================================");
  console.log(`Test Summary: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});

