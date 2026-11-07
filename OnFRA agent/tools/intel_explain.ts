// FILE: tools/intel_explain.ts
// explain_transaction: decodes one transaction from the free RPC; for swaps, contract calls and failures it also buys
// a call trace (Chainstack via Buy, $0.01) so internal calls and revert reasons can be explained. Priced in middleware/pricing.ts.
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { formatUnits } from "viem";
import { celoClient, getTokenMeta, isContract, KNOWN_LABELS, CELO_TOKEN } from "../lib/celoChain.js";
import { TRANSFER_TOPIC } from "../lib/sqdClient.js";
import { buyChainstackBatch, buyEnabled, type BuyPurchase } from "../lib/buyClient.js";

const SELECTORS: Record<string, string> = { "0xa9059cbb": "transfer(address,uint256)", "0x095ea7b3": "approve(address,uint256)", "0x23b872dd": "transferFrom(address,address,uint256)" };
const topicAddr = (t: string) => "0x" + t.slice(-40).toLowerCase();

function flattenTrace(node: any, out: any[] = []): any[] {
  if (!node) return out;
  out.push(node);
  for (const c of node.calls ?? []) flattenTrace(c, out);
  return out;
}

export const explainTransaction = tool(
  async ({ transaction_hash, wallet_address, use_trace }) => {
    const hash = transaction_hash as `0x${string}`;
    const warnings: string[] = [];
    const [tx, receipt] = await Promise.all([
      celoClient.getTransaction({ hash }).catch(() => null),
      celoClient.getTransactionReceipt({ hash }).catch(() => null),
    ]);
    if (!tx) throw new Error("Transaction not found on Celo (it may be pending, on another chain, or the hash is wrong).");
    const block = receipt ? await celoClient.getBlock({ blockNumber: receipt.blockNumber }) : null;
    const from = tx.from.toLowerCase(), to = (tx.to ?? "").toLowerCase();
    const perspective = wallet_address?.toLowerCase();
    const success = receipt ? receipt.status === "success" : null;
    const selector = tx.input.length >= 10 ? tx.input.slice(0, 10) : null;

    // ERC-20 movements from receipt logs
    const logs = (receipt?.logs ?? []).filter((l) => l.topics[0] === TRANSFER_TOPIC && l.topics.length === 3);
    const meta = await getTokenMeta(logs.map((l) => l.address));
    const moves = logs.map((l) => {
      const m = meta.get(l.address.toLowerCase())!;
      return { token: l.address.toLowerCase() === CELO_TOKEN ? "CELO" : m.symbol, token_address: l.address.toLowerCase(), from: topicAddr(l.topics[1] as string), to: topicAddr(l.topics[2] as string), amount: Number(formatUnits(BigInt(l.data), m.decimals)) };
    });

    const nativeValue = Number(formatUnits(tx.value, 18));
    const toIsContract = to ? await isContract(to).catch(() => false) : false;
    const label = KNOWN_LABELS[to]?.label;
    const outTokens = new Set(moves.filter((m) => m.from === from).map((m) => m.token));
    const inTokens = new Set(moves.filter((m) => m.to === from).map((m) => m.token));
    const isSwap = [...inTokens].some((t) => !outTokens.has(t)) && outTokens.size > 0;

    let type: string, category: string, confidence: number;
    if (success === false) { type = "failed"; category = "failed_transaction"; confidence = 0.95; }
    else if (!tx.to) { type = "contract_interaction"; category = "contract_deployment"; confidence = 0.9; }
    else if (tx.input === "0x" && !toIsContract) { type = "native_transfer"; category = "outgoing_payment"; confidence = 0.95; }
    else if (isSwap) { type = "swap"; category = "swap"; confidence = 0.75; }
    else if (selector === "0xa9059cbb" && moves.length === 1) { type = "token_transfer"; category = "outgoing_payment"; confidence = 0.9; }
    else if (toIsContract) { type = "contract_interaction"; category = label ? "known_protocol_call" : "contract_call"; confidence = label ? 0.8 : 0.5; }
    else { type = "unknown"; category = "unknown"; confidence = 0.2; }

    // Trace: the one thing a free node cannot give us (debug_traceTransaction is not whitelisted there).
    let trace: any = null;
    const purchases: BuyPurchase[] = [];
    const wantsTrace = use_trace && ["swap", "contract_interaction", "failed", "unknown"].includes(type);
    if (wantsTrace) {
      if (!buyEnabled()) warnings.push("Call trace skipped: purchases through Buy are disabled on this server.");
      else {
        try {
          const { results, purchase } = await buyChainstackBatch([{ jsonrpc: "2.0", id: 1, method: "debug_traceTransaction", params: [hash, { tracer: "callTracer" }] }]);
          purchases.push(purchase);
          if (results[0]?.error) warnings.push(`Trace unavailable: ${results[0].error.message ?? "RPC error"}`);
          else trace = results[0]?.result ?? null;
        } catch (e: any) { warnings.push(`Trace purchase failed: ${e.message}`); }
      }
    }

    let traceSummary: Record<string, unknown> | undefined;
    if (trace) {
      const nodes = flattenTrace(trace);
      const withValue = nodes.filter((n) => n.value && BigInt(n.value) > 0n).length;
      const errored = nodes.find((n) => n.error || n.revertReason);
      traceSummary = { internal_calls: nodes.length - 1, calls_moving_celo: withValue, ...(errored ? { error: errored.revertReason ?? errored.error, error_at: errored.to } : {}) };
      if (errored && type === "failed") category = "reverted_contract_call";
    }

    const who = (a: string) => KNOWN_LABELS[a]?.label ?? a;
    const parts: string[] = [];
    if (type === "failed") parts.push("The transaction was submitted but reverted, so no transfers took effect (gas was still spent).");
    if (nativeValue > 0) parts.push(`${from === perspective ? "You" : who(from)} sent ${nativeValue} CELO to ${who(to)}.`);
    for (const m of moves.slice(0, 5)) parts.push(`${m.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${m.token} moved from ${who(m.from)} to ${who(m.to)}.`);
    if (type === "swap") parts.push("The token flows indicate a swap: one asset went out and a different one came back in the same transaction.");
    if (type === "contract_interaction" && !moves.length && nativeValue === 0) parts.push(`The sender called ${who(to)} without moving any tokens${label ? "" : "; the contract is unlabeled"}.`);
    if (traceSummary) parts.push(`The trace shows ${(traceSummary as any).internal_calls} internal call(s)${(traceSummary as any).error ? ` and an error: ${(traceSummary as any).error}` : ""}.`);
    if (selector && !SELECTORS[selector] && toIsContract) warnings.push(`Function selector ${selector} is not decoded; the action is inferred from token movements.`);

    return JSON.stringify({
      chain: "celo", data_source: "onfra:celo-rpc" + (purchases.length ? "+chainstack(buy)" : ""),
      data_last_updated: new Date().toISOString(), generated_at: new Date().toISOString(),
      data_quality: { complete: warnings.length === 0, limitations: warnings },
      transaction_hash: hash, ...(block ? { block_timestamp: new Date(Number(block.timestamp) * 1000).toISOString() } : {}),
      ...(perspective ? { perspective_wallet: perspective } : {}),
      status: success === false ? "failed" : "success",
      transaction_type: type,
      summary: parts[0] ?? `A ${type.replace("_", " ")} transaction.`,
      details: {
        sender: from, recipient: to || null, ...(label ? { recipient_label: label } : {}), value_celo: nativeValue,
        token_transfers: moves, ...(selector ? { function_selector: selector, ...(SELECTORS[selector] ? { function: SELECTORS[selector] } : {}) } : {}),
        gas_used: receipt ? receipt.gasUsed.toString() : null, ...(traceSummary ? { trace: traceSummary } : {}),
      },
      classification: { category, confidence },
      explanation: parts.join(" ") || "No decodable transfers; the transaction may be a plain contract call.",
      warnings,
      purchases,
    }, null, 2);
  },
  {
    name: "explain_transaction",
    description: "Explains one Celo transaction in plain language: type, who sent what to whom, classification with confidence, and warnings. For swaps, contract calls and failures it buys a call trace for deeper detail.",
    schema: z.object({
      transaction_hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/).describe("Transaction hash (0x + 64 hex)"),
      chain: z.enum(["celo"]).default("celo"),
      wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional().describe("Optional wallet whose perspective to use"),
      use_trace: z.boolean().default(true).describe("Allow buying a call trace when the transaction is complex"),
    }),
  },
);
