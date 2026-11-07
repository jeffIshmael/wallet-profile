// FILE: scripts/balances_probe.ts
// Lists a wallet's Celo token balances so you can see what the agent sees, and compare the free public node with a Buy purchase.
//   npx tsx scripts/balances_probe.ts <wallet>            free: public node (multicall)
//   BUY_ENABLED=true npx tsx scripts/balances_probe.ts <wallet> --buy   also buys ONE Chainstack batch ($0.01) and compares
import { encodeFunctionData, erc20Abi, formatUnits } from "viem";
import { discoverTokens, getBalances, getTokenMeta, looksSpam, celoClient } from "../lib/celoChain.js";
import { buyChainstackBatch } from "../lib/buyClient.js";

const wallet = (process.argv[2] ?? "").toLowerCase();
if (!/^0x[0-9a-f]{40}$/.test(wallet)) { console.error("Usage: npx tsx scripts/balances_probe.ts <wallet> [--buy]"); process.exit(1); }

const t0 = Date.now();
const disc = await discoverTokens(wallet);
console.log(`token list: ${disc.tokens.length} contracts (source: ${disc.source}) in ${Date.now() - t0} ms`);

const t1 = Date.now();
const free = await getBalances(wallet, disc.tokens);
const held = disc.tokens.filter((t) => (free.tokens.get(t) ?? 0n) > 0n);
const meta = await getTokenMeta(held);
console.log(`public node: balances for ${disc.tokens.length} tokens in ${Date.now() - t1} ms (includes metadata)\n`);
console.log("CELO (native)".padEnd(22), formatUnits(free.native, 18));
for (const a of held) { const m = meta.get(a)!; console.log(`${m.symbol}${looksSpam(m.symbol, m.name) ? " (suspected spam)" : ""}`.padEnd(22), formatUnits(free.tokens.get(a)!, m.decimals).padEnd(24), a); }
console.log(`\nnon-zero: ${held.length} of ${disc.tokens.length} checked`);

if (process.argv.includes("--buy")) {
  const calls = [
    { jsonrpc: "2.0", id: 0, method: "eth_getBalance", params: [wallet, "latest"] },
    ...disc.tokens.map((t, i) => ({ jsonrpc: "2.0", id: i + 1, method: "eth_call", params: [{ to: t, data: encodeFunctionData({ abi: erc20Abi, functionName: "balanceOf", args: [wallet as `0x${string}`] }) }, "latest"] })),
  ];
  console.log(`\nbuying one Chainstack batch of ${calls.length} calls through Buy...`);
  const t2 = Date.now();
  const { results, purchase } = await buyChainstackBatch(calls);
  const byId = new Map(results.map((r: any) => [r.id, r]));
  let mismatches = 0;
  disc.tokens.forEach((t, i) => {
    const r: any = byId.get(i + 1);
    const bought = r?.result && r.result !== "0x" ? BigInt(r.result) : 0n;
    if (bought !== (free.tokens.get(t) ?? 0n)) mismatches++;
  });
  console.log(`Buy batch answered in ${Date.now() - t2} ms; ${results.length} results; mismatches vs public node: ${mismatches}`);
  console.log("settlement tx:", purchase.settlement_tx, "| cost: $" + purchase.price_usd);
  console.log(mismatches === 0 ? "Same answers as the free node, so the purchase added nothing here." : "The answers differ: look at which tokens.");
}