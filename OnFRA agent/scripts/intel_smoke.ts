// FILE: scripts/intel_smoke.ts
// Run: npx tsx scripts/intel_smoke.ts [wallet] [txHash]
// Calls every new tool once and prints a short result, so you can check SQD, the RPC and pricing before wiring the agent.
import { intelTools } from "../tools/intel_index.js";
import { celoClient } from "../lib/celoChain.js";

const wallet = process.argv[2] ?? "0x4821ced48fb4456055c86e42587f61c1f39c6315";
const txHash = process.argv[3] ?? "0x16b72ba76249e227c80bf25bacb34e327c327c60c663db436d70b700c908d35e";

const inputs: Record<string, any> = {
  analyze_wallet: { wallet_address: wallet, period: "30d" },
  get_cash_flow_summary: { wallet_address: wallet, period: "30d" },
  get_token_balances: { wallet_address: wallet },
  get_token_breakdown: { wallet_address: wallet, period: "30d", metric: "volume" },
  get_spending_breakdown: { wallet_address: wallet, period: "30d" },
  compare_periods: { wallet_address: wallet, current_period: "7d", previous_period: "30d" },
  get_dominant_counterparties: { wallet_address: wallet, period: "30d" },
  get_wallet_activity: { wallet_address: wallet, period: "7d" },
  explain_transaction: { transaction_hash: txHash },
  generate_transaction_statement: { wallet_address: wallet, period: "7d", format: "csv" },
};

try {
  console.log("Celo head block:", Number(await celoClient.getBlockNumber()));
} catch (e: any) {
  console.log("WARNING: Celo public RPC is not answering (" + e.message.slice(0, 120) + ").\n");
}

for (const t of intelTools) {
  const started = Date.now();
  try {
    const out = JSON.parse(await (t as any).invoke(inputs[t.name]));
    console.log(`OK   ${t.name} (${Date.now() - started} ms)`, JSON.stringify(out).slice(0, 220));
    if (out.data_quality?.limitations?.length) console.log("     limitations:", out.data_quality.limitations.length);
  } catch (e: any) {
    console.log(`FAIL ${t.name} (${Date.now() - started} ms)`, e.message);
  }
}
