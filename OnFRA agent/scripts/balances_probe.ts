// FILE: scripts/balances_probe.ts
// Lists a wallet's Celo token balances so you can see what the agent sees, and compare the free public node with a Buy purchase.
//   npx tsx scripts/balances_probe.ts <wallet>            free: public node (multicall)
//   BUY_ENABLED=true npx tsx scripts/balances_probe.ts <wallet> --buy   also buys ONE Chainstack batch ($0.01) and compares
import { encodeFunctionData, erc20Abi, formatUnits, toHex } from "viem";
import { discoverTokens, getBalances, getTokenMeta, flagSpam, celoClient, CELO_TOKEN } from "../lib/celoChain.js";
import { buyChainstackBatch } from "../lib/buyClient.js";

const wallet = (process.argv[2] ?? "").toLowerCase();
if (!/^0x[0-9a-f]{40}$/.test(wallet)) { console.error("Usage: npx tsx scripts/balances_probe.ts <wallet> [--buy]"); process.exit(1); }

const t0 = Date.now();
const disc = await discoverTokens(wallet);
const tokens = disc.tokens.filter((t) => t !== CELO_TOKEN);   // CELO is shown once, as native
console.log(`token list: ${tokens.length} contracts (source: ${disc.source}) in ${Date.now() - t0} ms`);

// Read at a fixed, slightly old block so both sources answer for the same moment (rebasing tokens change every block).
const block = (await celoClient.getBlockNumber()) - 5n;
const t1 = Date.now();
const free = await getBalances(wallet, tokens, block);
const heldAll = tokens.filter((t) => (free.tokens.get(t) ?? 0n) > 0n);
const meta = await getTokenMeta(heldAll);
const spam = flagSpam(heldAll.map((a) => ({ address: a, symbol: meta.get(a)!.symbol, name: meta.get(a)!.name })));
console.log(`public node: balances for ${tokens.length} tokens at block ${block} in ${Date.now() - t1} ms (includes metadata)\n`);
console.log("CELO (native)".padEnd(22), formatUnits(free.native, 18));
for (const a of heldAll.filter((x) => !spam.has(x))) { const m = meta.get(a)!; console.log(m.symbol.padEnd(22), formatUnits(free.tokens.get(a)!, m.decimals).padEnd(24), a); }
console.log(`\nshown: ${heldAll.length - spam.size} | hidden as suspected spam: ${spam.size} | checked: ${tokens.length}`);
for (const a of heldAll.filter((x) => spam.has(x))) console.log("  hidden:", meta.get(a)!.symbol.padEnd(12), a, `(${spam.get(a)})`);

if (process.argv.includes("--buy")) {
  const tag = toHex(block);
  const calls = [
    { jsonrpc: "2.0", id: 0, method: "eth_getBalance", params: [wallet, tag] },
    ...tokens.map((t, i) => ({ jsonrpc: "2.0", id: i + 1, method: "eth_call", params: [{ to: t, data: encodeFunctionData({ abi: erc20Abi, functionName: "balanceOf", args: [wallet as `0x${string}`] }) }, tag] })),
  ];
  console.log(`\nbuying one Chainstack batch of ${calls.length} calls through Buy (block ${block})...`);
  const t2 = Date.now();
  const { results, purchase } = await buyChainstackBatch(calls);
  const byId = new Map(results.map((r: any) => [r.id, r]));
  let mismatches = 0;
  tokens.forEach((t, i) => {
    const r: any = byId.get(i + 1);
    const bought = r?.result && r.result !== "0x" ? BigInt(r.result) : 0n;
    if (bought !== (free.tokens.get(t) ?? 0n)) { mismatches++; console.log("  differs:", t, "node:", String(free.tokens.get(t) ?? 0n), "buy:", String(bought), r?.error ? `(${r.error.message})` : ""); }
  });
  console.log(`Buy batch answered in ${Date.now() - t2} ms; ${results.length} results; mismatches vs public node: ${mismatches}`);
  console.log("settlement tx:", purchase.settlement_tx, "| cost: $" + purchase.price_usd);
  console.log(mismatches === 0 ? "Identical answers at the same block, and slower: the purchase added nothing for balances." : "Some answers differ: see the lines above.");
}