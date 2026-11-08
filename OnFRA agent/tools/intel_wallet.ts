// FILE: tools/intel_wallet.ts
// New intelligence tools (wallet profile, activity, balances, token breakdown). Existing tools are untouched.
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { formatUnits } from "viem";
import { ledgerFor, envelope, baseEnvelope, flowEntries, summarizeFlows, periodDays, normalizeAddress, round2 } from "../lib/ledger.js";
import { discoverTokens, getBalances, getTokenMeta, getCeloPriceUsd, flagSpam, STABLE_ADDRESSES, NATIVE, CELO_TOKEN } from "../lib/celoChain.js";
import { getWalletAge } from "../lib/getWalletDetails.js";

const wallet = z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Wallet address (0x...)");
const chain = z.enum(["celo"]).default("celo").describe("Blockchain. Celo only for now.");

const share = (part: number, total: number) => (total > 0 ? round2((part / total) * 100) : 0);

export const analyzeWallet = tool(
  async ({ wallet_address, period }) => {
    const w = normalizeAddress(wallet_address);
    const ledger = await ledgerFor(w, period);
    const flows = summarizeFlows(flowEntries(ledger));

    let ageDays = 0;
    const extra: string[] = [];
    try { ageDays = (await getWalletAge(w)).days; } catch {
      const first = Math.min(...ledger.hashes.values(), Infinity);
      ageDays = Number.isFinite(first) ? Math.floor((Date.now() / 1000 - first) / 86400) : 0;
      extra.push("Wallet age is measured from the first activity inside the period, not from the wallet's first ever transaction.");
    }

    const counterparties = new Set(flowEntries(ledger).map((e) => e.counterparty));
    const volume = new Map<string, { symbol: string; usd: number }>();
    for (const e of flowEntries(ledger)) {
      if (e.amountUsd === null) continue;
      const v = volume.get(e.asset.key) ?? { symbol: e.asset.symbol, usd: 0 };
      v.usd += e.amountUsd;
      volume.set(e.asset.key, v);
    }
    const totalVol = [...volume.values()].reduce((s, v) => s + v.usd, 0);
    const dominant = [...volume.values()].sort((a, b) => b.usd - a.usd)[0];
    const uniqueTokens = new Set(ledger.entries.map((e) => e.asset.key)).size;

    const txCount = ledger.hashes.size;
    const ratio = ledger.activeDays.size / periodDays(ledger.period);
    const level = txCount === 0 ? "dormant" : ratio < 0.1 ? "low" : ratio < 0.4 ? "medium" : "high";
    let weekday = 0, weekend = 0;
    for (const ts of ledger.hashes.values()) { const d = new Date(ts * 1000).getUTCDay(); d === 0 || d === 6 ? weekend++ : weekday++; }
    const weekdayShare = txCount ? weekday / txCount : 0;
    const mostActive = !txCount ? "none" : weekdayShare > 0.8 ? "weekdays" : weekdayShare < 0.5 ? "weekends" : "evenly spread";

    const insights: string[] = [];
    if (!txCount) insights.push("No activity was found in this period.");
    else {
      insights.push(`The wallet was active on ${ledger.activeDays.size} day(s) with ${txCount} transaction(s).`);
      if (flows.inflow || flows.outflow) insights.push(`Net flow was ${flows.net >= 0 ? "positive" : "negative"} at $${Math.abs(flows.net).toLocaleString()}.`);
      if (dominant) insights.push(`${dominant.symbol} accounts for ${share(dominant.usd, totalVol)}% of priced transfer volume.`);
    }

    return JSON.stringify({
      ...envelope(ledger, extra),
      wallet_overview: { wallet_age_days: ageDays, total_transactions: txCount, active_days: ledger.activeDays.size, unique_counterparties: counterparties.size },
      financial_summary: { total_received_usd: flows.inflow, total_sent_usd: flows.outflow, net_flow_usd: flows.net },
      token_overview: { ...(dominant ? { dominant_token: dominant.symbol, dominant_token_share: share(dominant.usd, totalVol) } : {}), unique_tokens: uniqueTokens },
      activity: { activity_level: level, most_active_period: mostActive },
      insights,
    }, null, 2);
  },
  {
    name: "analyze_wallet",
    description: "Flagship wallet profile: overview, received/sent totals, token mix, activity level and insights for a period (default 90d). Free. Use for general questions like 'tell me about this wallet'.",
    schema: z.object({ wallet_address: wallet, chain, period: z.string().default("90d").describe("7d, 30d, 90d, 1y, all-time, YYYY-MM or YYYY-MM-DD/YYYY-MM-DD") }),
  },
);

export const getWalletActivity = tool(
  async ({ wallet_address, period }) => {
    const w = normalizeAddress(wallet_address);
    const ledger = await ledgerFor(w, period);
    const stamps = [...ledger.hashes.values()].sort((a, b) => a - b);
    const n = stamps.length;
    const activeDays = ledger.activeDays.size;
    const ratio = activeDays / periodDays(ledger.period);
    const mid = ledger.period.start.getTime() / 1000 + (ledger.period.end.getTime() - ledger.period.start.getTime()) / 2000;
    const firstHalf = stamps.filter((t) => t < mid).length;
    const secondHalf = n - firstHalf;
    const trend = secondHalf > firstHalf * 1.25 ? "increasing" : secondHalf < firstHalf * 0.75 ? "decreasing" : "stable";
    const frequency = n === 0 ? "dormant" : ratio < 0.1 ? "sporadic" : ratio < 0.4 ? "regular" : "frequent";
    const iso = (t: number) => new Date(t * 1000).toISOString().slice(0, 10);
    return JSON.stringify({
      ...envelope(ledger),
      activity: { transaction_count: n, active_days: activeDays, average_transactions_per_active_day: activeDays ? round2(n / activeDays) : 0, ...(n ? { first_activity: iso(stamps[0]), last_activity: iso(stamps[n - 1]) } : {}) },
      activity_pattern: { frequency, trend },
      insights: n ? [`Activity looks ${frequency} and ${trend} across the period.`] : ["No activity found in this period."],
    }, null, 2);
  },
  {
    name: "get_wallet_activity",
    description: "How active a wallet is (transaction count, active days, first/last activity, frequency and trend), independent of value. Free.",
    schema: z.object({ wallet_address: wallet, chain, period: z.string().default("90d") }),
  },
);

export const getTokenBalances = tool(
  async ({ wallet_address, include_spam, include_prices }) => {
    const w = normalizeAddress(wallet_address);
    const limitations: string[] = [];
    const disc = await discoverTokens(w);
    if (!disc.complete) limitations.push("Token discovery is still catching up on older history; some tokens may be missing. Call again to continue.");
    if (disc.lookbackDays) limitations.push(`Token discovery only looks back ${disc.lookbackDays} days; older tokens that never moved again may be missing.`);
    limitations.push(
      disc.source === "explorer" ? "The token list is the Celo explorer's list plus a built-in list of known Celo tokens; balances are read directly from the chain."
      : disc.source === "known" ? "The Celo explorer was unreachable, so only a built-in list of known Celo tokens was checked; other tokens may be missing."
      : "Tokens are discovered from the wallet's incoming Transfer events; tokens credited without a Transfer event are not found."
    );
    // The CELO token contract mirrors the native balance, which is listed on its own row below.
    const candidates = disc.tokens.filter((t) => t !== CELO_TOKEN);
    const bal = await getBalances(w, candidates);
    const held = candidates.filter((t) => (bal.tokens.get(t) ?? 0n) > 0n);
    const meta = await getTokenMeta(held);
    const spamMap = flagSpam(held.map((a) => ({ address: a, symbol: meta.get(a)!.symbol, name: meta.get(a)!.name })));
    const celoPrice = include_prices ? await getCeloPriceUsd() : null;
    if (include_prices && celoPrice === null) limitations.push("CELO price unavailable.");

    const tokens: any[] = [{
      symbol: NATIVE.symbol, name: NATIVE.name, contract_address: null, decimals: NATIVE.decimals,
      balance: formatUnits(bal.native, 18), price_usd: celoPrice, value_usd: celoPrice == null ? null : round2(Number(formatUnits(bal.native, 18)) * celoPrice),
      is_suspected_spam: false,
    }];
    let hidden = 0;
    for (const a of held) {
      const m = meta.get(a)!;
      const raw = bal.tokens.get(a)!;
      const amount = formatUnits(raw, m.decimals);
      const price = include_prices && STABLE_ADDRESSES[a] ? 1 : null;
      const spam = spamMap.has(a);
      if (spam && !include_spam) { hidden++; continue; }
      tokens.push({ symbol: m.symbol, name: m.name, contract_address: a, decimals: m.decimals, balance: amount, price_usd: price, value_usd: price == null ? null : round2(Number(amount) * price), is_suspected_spam: spam });
    }
    if (hidden) limitations.push(`${hidden} suspected spam token(s) hidden (lookalike or non-Latin symbols, copied well-known symbols, or the same symbol on many contracts). Set include_spam to see them.`);
    const unpriced = tokens.filter((t) => t.value_usd === null && Number(t.balance) > 0).length;
    if (include_prices && unpriced) limitations.push(`${unpriced} token(s) have no price source and are excluded from the total.`);
    const total = include_prices ? round2(tokens.reduce((s, t) => s + (t.value_usd ?? 0), 0)) : null;
    return JSON.stringify({ ...baseEnvelope(w, disc.complete, limitations), total_value_usd: total, priced_at: include_prices ? new Date().toISOString() : null, tokens }, null, 2);
  },
  {
    name: "get_token_balances",
    description: "Current token holdings with USD valuation (stablecoins and CELO are priced; other tokens are listed without a price). Discovers tokens from the wallet's own history, so newly launched tokens are included. Free.",
    schema: z.object({ wallet_address: wallet, chain, include_spam: z.boolean().default(false), include_prices: z.boolean().default(true) }),
  },
);

export const getTokenBreakdown = tool(
  async ({ wallet_address, period, metric }) => {
    const w = normalizeAddress(wallet_address);
    const ledger = await ledgerFor(w, period);
    const limitations: string[] = [];
    type Row = { symbol: string; contract_address: string | null; balance?: string; balance_usd?: number; received_usd: number; sent_usd: number; total_volume_usd: number };
    const rows = new Map<string, Row>();
    const get = (key: string, symbol: string, addr: string | null): Row => {
      let r = rows.get(key);
      if (!r) { r = { symbol, contract_address: addr, received_usd: 0, sent_usd: 0, total_volume_usd: 0 }; rows.set(key, r); }
      return r;
    };

    if (metric === "balance") {
      const disc = await discoverTokens(w);
      const candidates = disc.tokens.filter((t) => t !== CELO_TOKEN);
      const bal = await getBalances(w, candidates);
      const heldAll = candidates.filter((t) => (bal.tokens.get(t) ?? 0n) > 0n);
      const metaAll = await getTokenMeta(heldAll);
      const spamMap = flagSpam(heldAll.map((a) => ({ address: a, symbol: metaAll.get(a)!.symbol, name: metaAll.get(a)!.name })));
      const held = heldAll.filter((a) => !spamMap.has(a));
      if (spamMap.size) limitations.push(`${spamMap.size} suspected spam token(s) left out of the balance breakdown.`);
      const meta = metaAll;
      const celoPrice = await getCeloPriceUsd();
      const nat = Number(formatUnits(bal.native, 18));
      const r = get("native", "CELO", null); r.balance = String(nat); if (celoPrice != null) r.balance_usd = round2(nat * celoPrice);
      for (const a of held) {
        const m = meta.get(a)!; const amt = formatUnits(bal.tokens.get(a)!, m.decimals);
        const row = get(a, m.symbol, a); row.balance = amt; if (STABLE_ADDRESSES[a]) row.balance_usd = round2(Number(amt));
      }
      limitations.push("Balances are current, not for the selected period. Tokens without a price source have a share of 0.");
    } else {
      for (const e of flowEntries(ledger)) {
        const r = get(e.asset.key, e.asset.symbol, e.asset.address);
        if (e.amountUsd === null) continue;
        if (e.direction === "in") r.received_usd += e.amountUsd; else r.sent_usd += e.amountUsd;
        r.total_volume_usd += e.amountUsd;
      }
    }

    const value = (r: Row) => metric === "balance" ? r.balance_usd ?? 0 : metric === "received" ? r.received_usd : metric === "sent" ? r.sent_usd : r.total_volume_usd;
    const total = [...rows.values()].reduce((s, r) => s + value(r), 0);
    const tokens = [...rows.values()].sort((a, b) => value(b) - value(a)).map((r) => ({
      symbol: r.symbol, contract_address: r.contract_address,
      ...(metric === "balance" ? { balance: r.balance, balance_usd: r.balance_usd } : {}),
      ...(metric === "received" || metric === "volume" ? { received_usd: round2(r.received_usd) } : {}),
      ...(metric === "sent" || metric === "volume" ? { sent_usd: round2(r.sent_usd) } : {}),
      ...(metric === "volume" ? { total_volume_usd: round2(r.total_volume_usd) } : {}),
      share_percent: share(value(r), total),
    }));
    const top = tokens[0];
    return JSON.stringify({
      ...envelope(ledger, limitations), metric, tokens,
      dominant_token: { symbol: top?.symbol ?? "none", share_percent: top?.share_percent ?? 0 },
    }, null, 2);
  },
  {
    name: "get_token_breakdown",
    description: "How a wallet's activity is distributed across tokens by balance, received, sent or volume. Balances and historical volume are separate measurements. Free.",
    schema: z.object({ wallet_address: wallet, chain, period: z.string().default("90d"), metric: z.enum(["balance", "received", "sent", "volume"]).default("volume") }),
  },
);