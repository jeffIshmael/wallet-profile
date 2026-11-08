// FILE: lib/ledger.ts
// Builds a normalized ledger (one entry per asset movement) for a wallet and a period
// using the public Celo node and explorer, plus the helpers every intel tool shares:
// period parsing, flow math, and the common response envelope.
import { formatUnits } from "viem";
import { getTokenMeta, getCeloPriceUsd, STABLE_ADDRESSES, CELO_TOKEN, NATIVE, celoClient } from "./celoChain.js";

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

// ---------- ledger ----------
const big = (x: unknown): bigint => { try { return x == null || x === "" ? 0n : BigInt(x as any); } catch { return 0n; } };
const CACHE_MS = 60_000;                 // fresh: reuse without hitting network
const STALE_MS = 6 * 60 * 60 * 1000;     // stale: only used when network fails
const ledgerCache = new Map<string, { at: number; ledger: Ledger }>();

async function fetchExplorerTxs(endpoint: "txlist" | "tokentx", wallet: string, startSec: number): Promise<any[]> {
  const base = (process.env.BLOCKSCOUT_URL ?? "https://celo.blockscout.com").replace(/\/$/, "");
  const allResults: any[] = [];
  const maxPages = 5;
  for (let page = 1; page <= maxPages; page++) {
    const url = `${base}/api?module=account&action=${endpoint}&address=${wallet}&sort=desc&page=${page}&offset=1000`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
      if (!res.ok) break;
      const json = (await res.json()) as any;
      if (json && Array.isArray(json.result)) {
        allResults.push(...json.result);
        if (json.result.length < 1000) break;
        const oldest = json.result[json.result.length - 1];
        const oldestTs = parseInt(oldest?.timeStamp || "0");
        if (oldestTs > 0 && oldestTs < startSec) break;
      } else {
        break;
      }
    } catch (e) {
      console.warn(`[ledger] Failed to fetch ${endpoint} page ${page} for ${wallet}:`, e);
      break;
    }
  }
  return allResults;
}

export async function loadLedger(wallet: string, period: Period): Promise<Ledger> {
  const w = wallet.toLowerCase();
  const cacheKey = period.fixed ? `${w}|${period.label}|${period.start.toISOString()}|${period.end.toISOString()}` : `${w}|${period.label}`;
  const hit = ledgerCache.get(cacheKey);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.ledger;

  const limitations: string[] = [];
  const startSec = Math.floor(period.start.getTime() / 1000);
  const endSec = Math.floor(period.end.getTime() / 1000);

  let normalList: any[] = [];
  let tokenList: any[] = [];
  let headBlock = 0;

  try {
    const [norm, tok, head] = await Promise.all([
      fetchExplorerTxs("txlist", w, startSec),
      fetchExplorerTxs("tokentx", w, startSec),
      celoClient.getBlockNumber().then((n) => Number(n)).catch(() => 0)
    ]);
    normalList = norm;
    tokenList = tok;
    headBlock = head;
  } catch (err: any) {
    if (hit && Date.now() - hit.at < STALE_MS) {
      const ago = Math.round((Date.now() - hit.at) / 60000);
      return {
        ...hit.ledger,
        complete: false,
        limitations: [`Data source temporarily unavailable; showing cached result from ${ago} minute(s) ago.`, ...hit.ledger.limitations]
      };
    }
    limitations.push(`Failed to fetch onchain transaction history: ${err?.message ?? err}`);
  }

  const hashes = new Map<string, number>();
  const activeDays = new Set<string>();
  const entries: LedgerEntry[] = [];
  const nativeKeys = new Set<string>();
  let lastTs = 0;
  let minBlock = headBlock || Infinity;
  let maxBlock = 0;

  const celoPrice = await getCeloPriceUsd();
  const celoAsset: Asset = { key: "native", symbol: NATIVE.symbol, address: null, decimals: NATIVE.decimals };

  // 1. Process normal native transactions
  for (const tx of normalList) {
    const ts = parseInt(tx.timeStamp || "0");
    if (isNaN(ts) || ts < startSec || ts > endSec) continue;
    lastTs = Math.max(lastTs, ts);
    const hash = tx.hash as string;
    hashes.set(hash, ts);
    activeDays.add(day(new Date(ts * 1000)));

    const bn = Number(tx.blockNumber);
    if (!isNaN(bn) && bn > 0) {
      if (bn < minBlock) minBlock = bn;
      if (bn > maxBlock) maxBlock = bn;
    }

    const isOk = tx.isError === "0" && (tx.txreceipt_status === undefined || tx.txreceipt_status === "1" || tx.txreceipt_status === "");
    const val = big(tx.value);
    if (!isOk || val === 0n) continue;

    const from = (tx.from || "").toLowerCase();
    const to = (tx.to || "").toLowerCase();
    const self = from === w && to === w;
    const dir: LedgerEntry["direction"] = self ? "self" : from === w ? "out" : to === w ? "in" : "self";
    if (dir === "self" && !self) continue;

    const amount = Number(formatUnits(val, 18));
    entries.push({
      hash,
      blockNumber: bn || 0,
      timestamp: ts,
      direction: dir,
      asset: celoAsset,
      amount,
      amountUsd: celoPrice == null ? null : amount * celoPrice,
      counterparty: dir === "out" ? to : from,
      isSwapLeg: false
    });
    nativeKeys.add(`${hash}|${dir}|${val}`);
  }

  // 2. Process ERC-20 token transfers
  const unknownTokens: string[] = [];
  for (const tx of tokenList) {
    const ts = parseInt(tx.timeStamp || "0");
    if (isNaN(ts) || ts < startSec || ts > endSec) continue;
    const addr = (tx.contractAddress || "").toLowerCase();
    if (addr && !tx.tokenSymbol && !tx.tokenDecimal) unknownTokens.push(addr);
  }
  const meta = unknownTokens.length > 0 ? await getTokenMeta(unknownTokens) : new Map();

  for (const tx of tokenList) {
    const ts = parseInt(tx.timeStamp || "0");
    if (isNaN(ts) || ts < startSec || ts > endSec) continue;
    lastTs = Math.max(lastTs, ts);
    const hash = tx.hash as string;
    hashes.set(hash, ts);
    activeDays.add(day(new Date(ts * 1000)));

    const bn = Number(tx.blockNumber);
    if (!isNaN(bn) && bn > 0) {
      if (bn < minBlock) minBlock = bn;
      if (bn > maxBlock) maxBlock = bn;
    }

    const raw = big(tx.value);
    if (raw === 0n) continue;

    const from = (tx.from || "").toLowerCase();
    const to = (tx.to || "").toLowerCase();
    const self = from === w && to === w;
    const dir: LedgerEntry["direction"] = self ? "self" : from === w ? "out" : to === w ? "in" : "self";
    if (dir === "self" && !self) continue;

    const contract = (tx.contractAddress || "").toLowerCase();
    const isCelo = contract === CELO_TOKEN;
    if (isCelo && nativeKeys.has(`${hash}|${dir}|${raw}`)) continue;

    const m = meta.get(contract);
    const decimals = tx.tokenDecimal ? parseInt(tx.tokenDecimal) : m ? m.decimals : 18;
    const symbol = tx.tokenSymbol || m?.symbol || "ERC20";
    const amount = Number(formatUnits(raw, decimals));
    const stable = STABLE_ADDRESSES[contract] !== undefined;
    const usd = isCelo ? (celoPrice == null ? null : amount * celoPrice) : stable ? amount : null;

    entries.push({
      hash,
      blockNumber: bn || 0,
      timestamp: ts,
      direction: dir,
      asset: isCelo ? celoAsset : { key: contract, symbol, address: contract, decimals },
      amount,
      amountUsd: usd,
      counterparty: dir === "out" ? to : from,
      isSwapLeg: false
    });
  }

  // 3. Detect swaps
  const byHash = new Map<string, LedgerEntry[]>();
  for (const e of entries) byHash.set(e.hash, [...(byHash.get(e.hash) ?? []), e]);
  for (const group of byHash.values()) {
    const outs = new Set(group.filter((e) => e.direction === "out").map((e) => e.asset.key));
    const ins = new Set(group.filter((e) => e.direction === "in").map((e) => e.asset.key));
    if (outs.size && ins.size && [...ins].some((k) => !outs.has(k))) {
      group.forEach((e) => (e.isSwapLeg = true));
    }
  }

  entries.sort((a, b) => a.timestamp - b.timestamp);
  const unpriced = entries.filter((e) => e.direction !== "self" && e.amountUsd === null).length;
  if (unpriced) limitations.push(`${unpriced} transfer(s) in tokens without a price are counted in transaction counts but excluded from USD totals.`);
  if (celoPrice == null) limitations.push("CELO price unavailable; CELO movements are excluded from USD totals.");
  else limitations.push("CELO is valued at the current price, not the price at transfer time.");
  limitations.push("Transfers between wallets owned by the same person cannot be detected; they are counted as flows. Gas fees are not included.");

  const nowSec = Math.floor(Date.now() / 1000);
  const fromBlock = maxBlock > 0 && Number.isFinite(minBlock) ? minBlock : Math.max(0, headBlock - (nowSec - startSec));
  const toBlock = maxBlock > 0 ? Math.min(headBlock || maxBlock, maxBlock) : (headBlock || 0);

  const ledger: Ledger = {
    wallet: w,
    period,
    entries,
    hashes,
    activeDays,
    complete: limitations.length === 0 || !limitations.some((l) => l.startsWith("Failed to fetch")),
    limitations,
    dataLastUpdated: lastTs ? new Date(lastTs * 1000) : new Date(),
    fromBlock,
    toBlock
  };

  if (ledger.complete) {
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

// ---------- response envelope ----------
export function periodBlock(p: Period) {
  return { label: p.label, start: day(p.start), end: day(p.end), complete: p.complete };
}

export function envelope(l: Ledger, extraLimitations: string[] = []) {
  return {
    wallet_address: l.wallet,
    chain: "celo",
    period: periodBlock(l.period),
    data_source: "onfra:celo-rpc",
    data_last_updated: l.dataLastUpdated.toISOString(),
    generated_at: new Date().toISOString(),
    data_quality: { complete: l.complete && l.period.complete, limitations: [...l.limitations, ...extraLimitations] },
  };
}

export function baseEnvelope(wallet: string, complete: boolean, limitations: string[]) {
  const now = new Date().toISOString();
  return { wallet_address: wallet.toLowerCase(), chain: "celo", data_source: "onfra:celo-rpc", data_last_updated: now, generated_at: now, data_quality: { complete, limitations } };
}

export const normalizeAddress = (a: string) => {
  if (!/^0x[a-fA-F0-9]{40}$/.test(a)) throw new Error(`Invalid wallet address: ${a}`);
  return a.toLowerCase();
};
