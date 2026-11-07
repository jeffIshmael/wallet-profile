// FILE: tools/intel_flows.ts
// New intelligence tools built on the ledger: cash flow, spending, period comparison, counterparties. Free at launch.
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ledgerFor, envelope, periodBlock, flowEntries, summarizeFlows, periodDays, normalizeAddress, round2, parsePeriod, loadLedger, baseEnvelope } from "../lib/ledger.js";
import { isContract, KNOWN_LABELS, type EntityType } from "../lib/celoChain.js";

const wallet = z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Wallet address (0x...)");
const chain = z.enum(["celo"]).default("celo").describe("Blockchain. Celo only for now.");
const pct = (part: number, total: number) => (total > 0 ? round2((part / total) * 100) : 0);

export const getCashFlowSummary = tool(
  async ({ wallet_address, period, start_date, end_date, currency }) => {
    const w = normalizeAddress(wallet_address);
    const p = start_date && end_date ? `${start_date}/${end_date}` : period;
    const ledger = await ledgerFor(w, p);
    const f = summarizeFlows(flowEntries(ledger));
    const days = periodDays(ledger.period);
    const extra: string[] = [];
    if (currency.toUpperCase() !== "USD") extra.push(`Currency conversion to ${currency} is not supported yet; amounts are in USD.`);
    const trend = f.net > f.inflow * 0.05 ? "positive" : f.net < -f.inflow * 0.05 || (f.inflow === 0 && f.outflow > 0) ? "negative" : "neutral";
    return JSON.stringify({
      ...envelope(ledger, extra),
      currency: "USD",
      cash_flow: { total_inflow: f.inflow, total_outflow: f.outflow, net_flow: f.net },
      transaction_counts: { incoming: f.incoming, outgoing: f.outgoing },
      averages: { daily_inflow: round2(f.inflow / days), daily_outflow: round2(f.outflow / days) },
      trend,
      methodology: { internal_transfers: "included", self_transfers: "excluded", swaps: "excluded", gas_fees: "excluded", failed_transactions: "excluded" },
      insights: [f.inflow || f.outflow ? `Net cash flow was ${f.net >= 0 ? "positive" : "negative"} ($${f.net.toLocaleString()}) over ${days} day(s).` : "No priced cash flow in this period."],
    }, null, 2);
  },
  {
    name: "get_cash_flow_summary",
    description: "Total inflow, outflow and net flow in USD for a period, with transaction counts, daily averages and trend. Swaps, self-transfers and failed transactions are excluded. Free.",
    schema: z.object({ wallet_address: wallet, chain, period: z.string().default("30d"), start_date: z.string().optional().describe("YYYY-MM-DD, use with end_date"), end_date: z.string().optional().describe("YYYY-MM-DD"), currency: z.string().default("USD") }),
  },
);

export const compareWalletPeriods = tool(
  async ({ wallet_address, current_period, previous_period, metrics }) => {
    const w = normalizeAddress(wallet_address);
    const cur = await loadLedger(w, parsePeriod(current_period));
    const prev = await loadLedger(w, parsePeriod(previous_period));
    const sum = (l: typeof cur) => { const f = summarizeFlows(flowEntries(l)); return { inflow: f.inflow, outflow: f.outflow, net_flow: f.net, transaction_count: l.hashes.size }; };
    const a = sum(cur), b = sum(prev);
    const want = metrics?.length ? metrics : (["inflow", "outflow", "net_flow", "transaction_count"] as const);
    const out: Record<string, { current: number; previous: number; change_percent: number | null }> = {};
    for (const m of want) out[m] = { current: a[m], previous: b[m], change_percent: b[m] === 0 ? null : round2(((a[m] - b[m]) / Math.abs(b[m])) * 100) };
    const win = (l: typeof cur) => ({ ...periodBlock(l.period), complete: l.period.complete && l.complete });
    const lenA = periodDays(cur.period), lenB = periodDays(prev.period);
    const equivalent = Math.abs(lenA - lenB) <= 1 && win(cur).complete && win(prev).complete;
    const insights = [equivalent ? "The two windows are comparable." : "The windows differ in length or one is incomplete, so changes may be misleading."];
    if (out.net_flow?.change_percent != null) insights.push(`Net flow changed by ${out.net_flow.change_percent}% versus the previous period.`);
    return JSON.stringify({
      ...baseEnvelope(w, cur.complete && prev.complete, [...new Set([...cur.limitations, ...prev.limitations])]),
      comparison: { current_period: win(cur), previous_period: win(prev), windows_equivalent: equivalent },
      metrics: out, insights,
    }, null, 2);
  },
  {
    name: "compare_periods",
    description: "Compares inflow, outflow, net flow and transaction count between two time windows (e.g. '2026-10' vs '2026-09', or '30d' vs a date range) with percentage change. Flags unequal or incomplete windows. Free.",
    schema: z.object({
      wallet_address: wallet, chain,
      current_period: z.string().describe("e.g. 2026-10, 30d, or YYYY-MM-DD/YYYY-MM-DD"),
      previous_period: z.string().describe("Same formats as current_period"),
      metrics: z.array(z.enum(["inflow", "outflow", "net_flow", "transaction_count"])).optional(),
    }),
  },
);

export const getDominantCounterparties = tool(
  async ({ wallet_address, period, limit, sort_by }) => {
    const w = normalizeAddress(wallet_address);
    const ledger = await ledgerFor(w, period);
    const map = new Map<string, { hashes: Set<string>; usd: number; dirs: Set<string> }>();
    for (const e of flowEntries(ledger)) {
      const c = map.get(e.counterparty) ?? { hashes: new Set(), usd: 0, dirs: new Set() };
      c.hashes.add(e.hash); c.dirs.add(e.direction); if (e.amountUsd !== null) c.usd += e.amountUsd;
      map.set(e.counterparty, c);
    }
    const ranked = [...map.entries()].sort((x, y) => sort_by === "frequency" ? y[1].hashes.size - x[1].hashes.size : y[1].usd - x[1].usd).slice(0, limit);
    const counterparties: Array<{ address: string; label: string | null; entity_type: EntityType; interaction_count: number; total_volume_usd: number; direction: "incoming" | "outgoing" | "both" }> = [];
    for (const [address, c] of ranked) {
      const known = KNOWN_LABELS[address];
      let type: EntityType = known?.type ?? "unknown";
      if (!known) { try { type = (await isContract(address)) ? "contract" : "wallet"; } catch { type = "unknown"; } }
      counterparties.push({ address, label: known?.label ?? null, entity_type: type, interaction_count: c.hashes.size, total_volume_usd: round2(c.usd), direction: c.dirs.size > 1 ? "both" : [...c.dirs][0] === "in" ? "incoming" : "outgoing" });
    }
    return JSON.stringify({ ...envelope(ledger, ["Only a few well-known addresses are labeled; others are classified as wallet or contract."]), sort_by, counterparties }, null, 2);
  },
  {
    name: "get_dominant_counterparties",
    description: "Ranks the addresses a wallet interacts with most, by USD volume or frequency, with labels where known and direction. Free.",
    schema: z.object({ wallet_address: wallet, chain, period: z.string().default("90d"), limit: z.number().int().min(1).max(50).default(10), sort_by: z.enum(["volume", "frequency"]).default("volume") }),
  },
);

export const getSpendingBreakdown = tool(
  async ({ wallet_address, period, group_by }) => {
    const w = normalizeAddress(wallet_address);
    const ledger = await ledgerFor(w, period);
    const outs = flowEntries(ledger).filter((e) => e.direction === "out");
    const kindCache = new Map<string, { label: string; confidence: number }>();
    const classify = async (addr: string) => {
      const hit = kindCache.get(addr); if (hit) return hit;
      const known = KNOWN_LABELS[addr];
      let r = { label: "Unknown", confidence: 0.3 };
      if (known) r = { label: known.type === "protocol" ? "Protocol interactions" : "Contract interactions", confidence: 0.9 };
      else { try { r = (await isContract(addr)) ? { label: "Contract interactions", confidence: 0.6 } : { label: "Transfers to wallets", confidence: 0.7 }; } catch { /* keep Unknown */ } }
      kindCache.set(addr, r); return r;
    };
    const groups = new Map<string, { usd: number; hashes: Set<string>; conf: number[] }>();
    for (const e of outs) {
      if (e.amountUsd === null) continue;
      let label: string, conf = 1;
      if (group_by === "token") label = e.asset.symbol;
      else if (group_by === "counterparty") label = KNOWN_LABELS[e.counterparty]?.label ?? e.counterparty;
      else if (group_by === "protocol") { const k = KNOWN_LABELS[e.counterparty]; label = k && k.type === "protocol" ? k.label : "Unlabeled"; conf = k ? 0.9 : 0.3; }
      else { const c = await classify(e.counterparty); label = c.label; conf = c.confidence; }
      const g = groups.get(label) ?? { usd: 0, hashes: new Set(), conf: [] };
      g.usd += e.amountUsd; g.hashes.add(e.hash); g.conf.push(conf); groups.set(label, g);
    }
    const total = [...groups.values()].reduce((s, g) => s + g.usd, 0);
    const breakdown = [...groups.entries()].sort((a, b) => b[1].usd - a[1].usd).map(([label, g]) => ({
      label, amount_usd: round2(g.usd), share_percent: pct(g.usd, total), transaction_count: g.hashes.size,
      confidence: round2(g.conf.reduce((s, c) => s + c, 0) / g.conf.length),
    }));
    return JSON.stringify({
      ...envelope(ledger, ["Spending categories are inferred from whether the recipient is a wallet or a contract and a short list of known addresses; treat them as rough."]),
      group_by, total_spending_usd: round2(total), breakdown,
      insights: breakdown.length ? [`The largest spending group is "${breakdown[0].label}" at ${breakdown[0].share_percent}% of priced outflow.`] : ["No priced outgoing transfers in this period."],
    }, null, 2);
  },
  {
    name: "get_spending_breakdown",
    description: "Where a wallet's outgoing money went, grouped by token, counterparty, protocol or category, with a confidence for each group. Free.",
    schema: z.object({ wallet_address: wallet, chain, period: z.string().default("30d"), group_by: z.enum(["token", "counterparty", "protocol", "category"]).default("category") }),
  },
);
