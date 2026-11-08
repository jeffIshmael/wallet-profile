// FILE: scripts/explain_probe.ts
// Shows what explain_transaction does and, when it buys a call trace through Buy, the proof of the purchase.
//   npx tsx scripts/explain_probe.ts <txHash> [wallet]                      free: decodes from the public node only
//   BUY_ENABLED=true npx tsx scripts/explain_probe.ts <txHash> [wallet]     may buy ONE Chainstack trace ($0.01)
// A purchase happens only for swaps, contract calls, failed transactions and unknown types. Simple transfers never buy.
import { explainTransaction } from "../tools/intel_explain.js";
import { buyEnabled } from "../lib/buyClient.js";

const hash = process.argv[2] ?? "";
const wallet = process.argv[3];
if (!/^0x[0-9a-fA-F]{64}$/.test(hash)) { console.error("Usage: npx tsx scripts/explain_probe.ts <txHash> [wallet]"); process.exit(1); }

console.log(`Buy purchases: ${buyEnabled() ? "ENABLED (BUY_ENABLED=true)" : "disabled (set BUY_ENABLED=true to allow one $0.01 trace purchase)"}\n`);
const started = Date.now();
const out = JSON.parse(await (explainTransaction as any).invoke({ transaction_hash: hash, chain: "celo", ...(wallet ? { wallet_address: wallet } : {}), use_trace: true }));

console.log("type:          ", out.transaction_type, `(${out.classification.category}, confidence ${out.classification.confidence})`);
console.log("status:        ", out.status);
console.log("summary:       ", out.summary);
console.log("data source:   ", out.data_source);
console.log(`took:           ${Date.now() - started} ms\n`);

if (out.purchases.length) {
  for (const p of out.purchases) {
    console.log("BOUGHT THROUGH BUY");
    console.log("  service:      ", p.service);
    console.log("  route:        ", p.route);
    console.log("  price:        ", `$${p.price_usd}`, p.token);
    console.log("  settlement tx:", p.settlement_tx);
    if (p.settlement_tx) console.log("  explorer:     ", `https://celoscan.io/tx/${p.settlement_tx}`);
  }
  if (out.details.trace) console.log("\ntrace result:  ", JSON.stringify(out.details.trace));
} else {
  const simple = ["native_transfer", "token_transfer"].includes(out.transaction_type);
  console.log("NO PURCHASE:", simple ? "a simple transfer, so the free public node was enough." : buyEnabled() ? "see the warnings below." : "purchases are disabled.");
}
if (out.warnings.length) console.log("\nwarnings:\n - " + out.warnings.join("\n - "));
console.log("\nYour payment history: buy receipts");