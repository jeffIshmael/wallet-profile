// FILE: lib/ledger.ts
// Turns raw SQD blocks into a normalized ledger (one entry per asset movement) for a wallet and a period,
// plus the helpers every intel tool shares: period parsing, flow math, and the common response envelope.
import { formatUnits } from "viem";
import { sqdHead, sqdBlockAtTimestamp, streamRange, walletQuery, TRANSFER_TOPIC } from "./sqdClient.js";
import { getTokenMeta, getCeloPriceUsd, STABLE_ADDRESSES, CELO_TOKEN, NATIVE } from "./celoChain.js";

export interface Period { label: string; start: Date; end: Date; allTime: boolean; complete: boolean; fixed: boolean }  // fixed = a calendar month or explicit range (cacheable by dates); otherwise a trailing window
export interface Asset { key: string; symbol: string; address: string | null; decimals: number }
export interface LedgerEntry {
  hash: string; blockNumber: number; timestamp: number;
  direction: "in" | "out" | "self";
  asset: Asset; amount: number; amountUsd: number | null;
  counterparty: string; isSwapLeg: boolean;
}
export interface Ledger {
  wallet: string; period: Period; entries: LedgerEntry[];
  hashes: Map<string, number>;       // every tx touching the wallet in the period -> unix ts
  activeDays: Set<string>;           // UTC dates with any activity
  complete: boolean; limitations: string[]; dataLastUpdated: Date; fromBlock: number; toBlock: number;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
const day = (d: Date) => d.toISOString().slice(0, 10);

// ---------- periods ----------
export function parsePeriod(input: string, now = new Date()): Period {
  const s = input.trim().toLowerCase();
  let m: RegExpMatchArray | null;
  const trailing = (days: number): Period => ({ label: s, start: new Date(now.getTime() - days * 86_400_000), end: now, allTime: false, complete: true, fixed: false });
  if (["all-time", "all", "alltime"].includes(s)) return { label: "all-time", start: new Date(Date.UTC(2020, 3, 22)), end: now, allTime: true, complete: true, fixed: false };
  if ((m = s.match(/^(\d+)\s*d$/))) return trailing(Number(m[1]));
  if ((m = s.match(/^(\d+)\s*y$/))) return trailing(Number(m[1]) * 365);
  if ((m = s.match(/^(\d{4})-(\d{2})$/))) {
    const start = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1));
    const monthEnd = new Date(Date.UTC(Number(m[1]), Number(m[2]), 1) - 1000);
    return { label: s, start, end: monthEnd < now ? monthEnd : now, allTime: false, complete: monthEnd <= now, fixed: true };
  }
  if ((m = s.match(/^(\d{4}-\d{2}-\d{2})\/(\d{4}-\d{2}-\d{2})$/))) {
    const start = new Date(`${m[1]}T00:00:00Z`);
    const dayEnd = new Date(`${m[2]}T23:59:59Z`);
    if (isNaN(start.getTime()) || isNaN(dayEnd.getTime()) || dayEnd < start) throw new Error(`Invalid period range "${input}"`);
    return { label: s, start, end: dayEnd < now ? dayEnd : now, allTime: false, complete: dayEnd <= now, fixed: true };
  }
  throw new Error(`Unsupported period "${input}". Use 7d, 30d, 90d, 1y, all-time, YYYY-MM, or YYYY-MM-DD/YYYY-MM-DD.`);
}

export const periodDays = (p: Period) => Math.max(1, Math.ceil((p.end.getTime() - p.start.getTime()) / 86_400_000));

async function resolveBlocks(p: Period) {
  const head = await sqdHead();
  const nowSec = Math.floor(Date.now() / 1000);
  let estimated = false;
  const endSec = Math.floor(p.end.getTime() / 1000);
  let toBlock = head;
  if (endSec < nowSec - 60) {
    const b = await sqdBlockAtTimestamp(endSec);
    if (b === null) { estimated = true; toBlock = Math.max(0, head - (nowSec - endSec)); } else toBlock = b;
  }
  let fromBlock = 0;
  if (!p.allTime) {
    const startSec = Math.floor(p.start.getTime() / 1000);
    const b = await sqdBlockAtTimestamp(startSec);
    if (b === null) { estimated = true; fromBlock = Math.max(0, head - (nowSec - startSec)); } else fromBlock = b;
  }
  return { fromBlock, toBlock: Math.min(toBlock, head), estimated };
}

// ---------- ledger ----------
const big = (x: unknown): bigint => { try { return x == null || x === "" ? 0n : BigInt(x as any); } catch { return 0n; } };
const topicAddr = (t: string) => "0x" + t.slice(-40).toLowerCase();
const CACHE_MS = 60_000;                 // fresh: reuse without asking SQD
const STALE_MS = 6 * 60 * 60 * 1000;     // stale: only used when SQD is failing
const ledgerCache = new Map<string, { at: number; ledger: Ledger }>();

export async function loadLedger(wallet: string, period: Period): Promise<Ledger> {
  const w = wallet.toLowerCase();
  // Trailing windows ("30d") move every millisecond, so they are keyed by label only; fixed ranges include their dates.
  const cacheKey = period.fixed ? `${w}|${period.label}|${period.start.toISOString()}|${period.end.toISOString()}` : `${w}|${period.label}`;
  const hit = ledgerCache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.ledger;

  const limitations: string[] = [];
  let range: Awaited<ReturnType<typeof resolveBlocks>>;
  let stream: Awaited<ReturnType<typeof streamRange>>;
  try {
    range = await resolveBlocks(period);
    stream = await streamRange(walletQuery(w), range.fromBlock, range.toBlock);
  } catch (err) {
    // SQD is down or overloaded: fall back to the last good result for this wallet and period, clearly labeled.
    if (hit && Date.now() - hit.at < STALE_MS) {
      const ago = Math.round((Date.now() - hit.at) / 60000);
      return { ...hit.ledger, complete: false, limitations: [`The data source was unavailable, so this is the last successful result from ${ago} minute(s) ago.`, ...hit.ledger.limitations] };
    }
    throw err;
  }
  const { fromBlock, toBlock, estimated } = range;
  if (estimated) limitations.push("Block range was estimated from timestamps (1-second block time assumed).");
  if (!stream.complete) limitations.push(`History scan stopped at block ${stream.reached} of ${toBlock}${stream.error ? ` (${stream.error.slice(0, 120)})` : ""}; results cover only part of the period.`);

  const hashes = new Map<string, number>();
  const activeDays = new Set<string>();
  const txMeta = new Map<string, { from: string; to: string; value: bigint; ok: boolean; ts: number; block: number }>();
  const rawLogs: { address: string; topics: string[]; data: string; hash: string; ts: number; block: number }[] = [];
  let lastTs = 0;

  for (const b of stream.blocks) {
    const ts = b.header.timestamp;
    lastTs = Math.max(lastTs, ts);
    for (const tx of b.transactions ?? []) {
      hashes.set(tx.hash, ts);
      activeDays.add(day(new Date(ts * 1000)));
      txMeta.set(tx.hash, { from: (tx.from ?? "").toLowerCase(), to: (tx.to ?? "").toLowerCase(), value: big(tx.value), ok: tx.status === undefined || Number(tx.status) !== 0, ts, block: b.header.number });
    }
    for (const lg of b.logs ?? []) {
      hashes.set(lg.transactionHash, ts);
      activeDays.add(day(new Date(ts * 1000)));
      rawLogs.push({ address: lg.address.toLowerCase(), topics: lg.topics, data: lg.data ?? "0x", hash: lg.transactionHash, ts, block: b.header.number });
    }
  }

  const celoPrice = await getCeloPriceUsd();
  const celoAsset: Asset = { key: "native", symbol: NATIVE.symbol, address: null, decimals: NATIVE.decimals };
  const entries: LedgerEntry[] = [];
  const nativeKeys = new Set<string>();

  // native CELO transfers (transaction value)
  for (const [hash, t] of txMeta) {
    if (!t.ok || t.value === 0n) continue;
    const amount = Number(formatUnits(t.value, 18));
    const self = t.from === w && t.to === w;
    const dir: LedgerEntry["direction"] = self ? "self" : t.from === w ? "out" : t.to === w ? "in" : "self";
    if (dir === "self" && !self) continue;
    entries.push({ hash, blockNumber: t.block, timestamp: t.ts, direction: dir, asset: celoAsset, amount, amountUsd: celoPrice == null ? null : amount * celoPrice, counterparty: dir === "out" ? t.to : t.from, isSwapLeg: false });
    nativeKeys.add(`${hash}|${dir}|${t.value}`);
  }

  // ERC-20 transfers (3-topic Transfer logs; 4-topic ones are NFTs and are ignored)
  const erc20 = rawLogs.filter((l) => l.topics[0] === TRANSFER_TOPIC && l.topics.length === 3);
  const meta = await getTokenMeta(erc20.map((l) => l.address));
  for (const l of erc20) {
    const from = topicAddr(l.topics[1]);
    const to = topicAddr(l.topics[2]);
    const raw = big(l.data);
    if (raw === 0n) continue;
    const dir: LedgerEntry["direction"] = from === w && to === w ? "self" : from === w ? "out" : to === w ? "in" : "self";
    if (dir === "self" && !(from === w && to === w)) continue;
    const isCelo = l.address === CELO_TOKEN;
    if (isCelo && nativeKeys.has(`${l.hash}|${dir}|${raw}`)) continue; // same movement already counted from tx value
    const m = isCelo ? { symbol: NATIVE.symbol, decimals: NATIVE.decimals } : meta.get(l.address)!;
    const amount = Number(formatUnits(raw, m.decimals));
    const stable = STABLE_ADDRESSES[l.address] !== undefined;
    const usd = isCelo ? (celoPrice == null ? null : amount * celoPrice) : stable ? amount : null;
    entries.push({
      hash: l.hash, blockNumber: l.block, timestamp: l.ts, direction: dir,
      asset: isCelo ? celoAsset : { key: l.address, symbol: m.symbol, address: l.address, decimals: m.decimals },
      amount, amountUsd: usd, counterparty: dir === "out" ? to : from, isSwapLeg: false,
    });
  }

  // swaps: same tx has at least one asset going out and a different asset coming in
  const byHash = new Map<string, LedgerEntry[]>();
  for (const e of entries) byHash.set(e.hash, [...(byHash.get(e.hash) ?? []), e]);
  for (const group of byHash.values()) {
    const outs = new Set(group.filter((e) => e.direction === "out").map((e) => e.asset.key));
    const ins = new Set(group.filter((e) => e.direction === "in").map((e) => e.asset.key));
    if (outs.size && ins.size && [...ins].some((k) => !outs.has(k))) group.forEach((e) => (e.isSwapLeg = true));
  }

  entries.sort((a, b) => a.timestamp - b.timestamp);
  const unpriced = entries.filter((e) => e.direction !== "self" && e.amountUsd === null).length;
  if (unpriced) limitations.push(`${unpriced} transfer(s) in tokens without a price are counted in transaction counts but excluded from USD totals.`);
  if (celoPrice == null) limitations.push("CELO price unavailable; CELO movements are excluded from USD totals.");
  else limitations.push("CELO is valued at the current price, not the price at transfer time.");
  limitations.push("Transfers between wallets owned by the same person cannot be detected; they are counted as flows. Gas fees are not included.");

  const ledger: Ledger = { wallet: w, period, entries, hashes, activeDays, complete: stream.complete, limitations, dataLastUpdated: lastTs ? new Date(lastTs * 1000) : new Date(), fromBlock, toBlock };
  if (stream.complete) {
    if (ledgerCache.size >= 200) ledgerCache.delete(ledgerCache.keys().next().value as string);
    ledgerCache.set(cacheKey, { at: Date.now(), ledger });
  }
  return ledger;
}

export async function ledgerFor(address: string, periodStr: string): Promise<Ledger> {
  return loadLedger(address.toLowerCase(), parsePeriod(periodStr));
}

// ---------- flow math ----------
export const flowEntries = (l: Ledger) => l.entries.filter((e) => e.direction !== "self" && !e.isSwapLeg);

export function summarizeFlows(entries: LedgerEntry[]) {
  let inflow = 0, outflow = 0, incoming = 0, outgoing = 0;
  for (const e of entries) {
    if (e.direction === "in") { incoming++; if (e.amountUsd !== null) inflow += e.amountUsd; }
    else if (e.direction === "out") { outgoing++; if (e.amountUsd !== null) outflow += e.amountUsd; }
  }
  return { inflow: round2(inflow), outflow: round2(outflow), net: round2(inflow - outflow), incoming, outgoing };
}

// ---------- response envelope (matches the published result schemas) ----------
export function periodBlock(p: Period) {
  return { label: p.label, start: day(p.start), end: day(p.end), complete: p.complete };
}

export function envelope(l: Ledger, extraLimitations: string[] = []) {
  return {
    wallet_address: l.wallet,
    chain: "celo",
    period: periodBlock(l.period),
    data_source: "onfra:sqd+celo-rpc",
    data_last_updated: l.dataLastUpdated.toISOString(),
    generated_at: new Date().toISOString(),
    data_quality: { complete: l.complete && l.period.complete, limitations: [...l.limitations, ...extraLimitations] },
  };
}

export function baseEnvelope(wallet: string, complete: boolean, limitations: string[]) {
  const now = new Date().toISOString();
  return { wallet_address: wallet.toLowerCase(), chain: "celo", data_source: "onfra:sqd+celo-rpc", data_last_updated: now, generated_at: now, data_quality: { complete, limitations } };
}

export const normalizeAddress = (a: string) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(a)) throw new Error(`Invalid wallet address: ${a}`);
  return a.toLowerCase();
};
