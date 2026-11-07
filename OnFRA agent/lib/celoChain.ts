// FILE: lib/celoChain.ts
// Celo reads over a public RPC (free): token metadata, balances, prices, contract checks, token discovery.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createPublicClient, http, erc20Abi } from "viem";
import { celo } from "viem/chains";
import { sqdHead, streamCells } from "./sqdClient.js";
import { KNOWN_TOKEN_ADDRESSES } from "./knownTokens.js";

export const celoClient = createPublicClient({ chain: celo, transport: http(process.env.CELO_RPC_URL ?? "https://forno.celo.org") });

export const CELO_TOKEN = "0x471ece3750da237f93b8e339c536989b8978a438";
export const NATIVE = { symbol: "CELO", name: "Celo", decimals: 18 };

/** Valued at $1. Matched by contract address only, never by symbol (scam tokens copy symbols). */
export const STABLE_ADDRESSES: Record<string, string> = {
  "0xceba9300f2b948710d2653dd7b07f33a8b32118c": "USDC",
  "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e": "USDT",
  "0x765de816845861e75a25fca122bb6898b8b1282a": "cUSD",
};

export type EntityType = "exchange" | "protocol" | "contract" | "wallet" | "unknown";
/** Extend as you learn addresses. Only add addresses you have verified. */
export const KNOWN_LABELS: Record<string, { label: string; type: EntityType }> = {
  "0x8004a169fb4a3325136eb29fa0ceb6d2e539a432": { label: "ERC-8004 Identity Registry", type: "protocol" },
  "0x20faaca5f980e29639a0fcc6dca6988e18ed333b": { label: "Buy gateway", type: "protocol" },
  "0xceba9300f2b948710d2653dd7b07f33a8b32118c": { label: "USDC token", type: "contract" },
  "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e": { label: "USDT token", type: "contract" },
  "0x765de816845861e75a25fca122bb6898b8b1282a": { label: "cUSD token", type: "contract" },
  "0x471ece3750da237f93b8e339c536989b8978a438": { label: "CELO token", type: "contract" },
};

export interface TokenMeta { address: string; symbol: string; name: string; decimals: number }
const metaCache = new Map<string, TokenMeta>();

export async function getTokenMeta(addresses: string[]): Promise<Map<string, TokenMeta>> {
  const all = [...new Set(addresses.map((a) => a.toLowerCase()))].filter((a) => /^0x[0-9a-f]{40}$/.test(a));
  const need = all.filter((a) => !metaCache.has(a));
  for (let i = 0; i < need.length; i += 100) {
    const chunk = need.slice(i, i + 100);
    const contracts = chunk.flatMap((a) => [
      { address: a as `0x${string}`, abi: erc20Abi, functionName: "symbol" },
      { address: a as `0x${string}`, abi: erc20Abi, functionName: "decimals" },
      { address: a as `0x${string}`, abi: erc20Abi, functionName: "name" },
    ]);
    const callArgs: any = { contracts, allowFailure: true };
    const res = (await celoClient.multicall(callArgs)) as any[];
    chunk.forEach((a, idx) => {
      const [s, d, n] = [res[idx * 3], res[idx * 3 + 1], res[idx * 3 + 2]] as any[];
      metaCache.set(a, {
        address: a,
        symbol: s.status === "success" ? String(s.result) : "UNKNOWN",
        decimals: d.status === "success" ? Number(d.result) : 18,
        name: n.status === "success" ? String(n.result) : "",
      });
    });
  }
  return new Map(all.map((a) => [a, metaCache.get(a) as TokenMeta]));
}

export function looksSpam(symbol: string, name: string): boolean {
  const s = `${symbol} ${name}`.toLowerCase();
  return symbol.length > 16 || /https?:|www\.|\.com|\.io|\.xyz|claim|visit|airdrop|reward/.test(s);
}

export async function getBalances(wallet: string, tokenList: string[]) {
  const tokens = [...new Set(tokenList.map((a) => a.toLowerCase()))].filter((a) => /^0x[0-9a-f]{40}$/.test(a)); // one malformed address would fail the whole batch
  const w = wallet as `0x${string}`;
  const native = await celoClient.getBalance({ address: w });
  const out = new Map<string, bigint>();
  for (let i = 0; i < tokens.length; i += 200) {
    const chunk = tokens.slice(i, i + 200);
    const callArgs: any = {
      contracts: chunk.map((a) => ({ address: a as `0x${string}`, abi: erc20Abi, functionName: "balanceOf", args: [w] })),
      allowFailure: true,
    };
    const res = (await celoClient.multicall(callArgs)) as any[];
    chunk.forEach((a, idx) => {
      const r = res[idx] as any;
      out.set(a, r.status === "success" ? (r.result as bigint) : 0n);
    });
  }
  return { native, tokens: out };
}

let priceCache: { v: number | null; t: number } | null = null;
/** CELO/USD. CoinGecko free endpoint, cached 5 min; falls back to CELO_PRICE_USD. Null if neither works. */
export async function getCeloPriceUsd(): Promise<number | null> {
  if (priceCache && Date.now() - priceCache.t < 300_000) return priceCache.v;
  let v: number | null = null;
  try {
    const r = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd");
    if (r.ok) {
      const j = (await r.json()) as any;
      if (typeof j?.celo?.usd === "number") v = j.celo.usd;
    }
  } catch { /* fall through */ }
  if (v === null && process.env.CELO_PRICE_USD) v = Number(process.env.CELO_PRICE_USD);
  priceCache = { v, t: Date.now() };
  return v;
}

const codeCache = new Map<string, boolean>();
export async function isContract(addr: string): Promise<boolean> {
  const a = addr.toLowerCase();
  if (codeCache.has(a)) return codeCache.get(a) as boolean;
  const code = await celoClient.getCode({ address: a as `0x${string}` });
  const v = !!code && code !== "0x";
  codeCache.set(a, v);
  return v;
}

// ---- token discovery: every token contract that ever sent something to this wallet ----
// Serverless hosts (Vercel) only allow writes under the temp dir. Override with ONFRA_CACHE_DIR if you mount storage.
const CACHE_DIR = process.env.ONFRA_CACHE_DIR ?? path.join(os.tmpdir(), "onfra-cache");
interface DiscoveryState { tokens: string[]; lastBlock: number }

/** Lists the tokens a wallet holds from the Celo explorer (Blockscout) in one request. Only the contract addresses are used;
 *  the balances themselves are always read from the chain. Returns null if the explorer is unreachable or answers in an unknown shape. */
async function discoverViaExplorer(wallet: string): Promise<string[] | null> {
  const base = (process.env.BLOCKSCOUT_URL ?? "https://celo.blockscout.com").replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/api/v2/addresses/${wallet}/token-balances`, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    const items = (await res.json()) as any;
    if (!Array.isArray(items)) return null;
    const out = new Set<string>();
    for (const it of items) {
      const t = it?.token;
      const addr = String(t?.address_hash ?? t?.address ?? "").toLowerCase();
      const type = String(t?.type ?? "ERC-20").toUpperCase();
      if (/^0x[0-9a-f]{40}$/.test(addr) && type === "ERC-20") out.add(addr);
    }
    return [...out];
  } catch {
    return null;
  }
}

/** Token contracts to check for a wallet. Default (no SQD): the built-in list of known Celo tokens plus whatever the Celo
 *  explorer says the wallet holds, one request, then balances are read from the public node. If the explorer is unreachable
 *  only the known list is checked. TOKEN_DISCOVERY_SOURCE=sqd switches to scanning the wallet's incoming Transfer events
 *  on SQD (slow on the first call); TOKEN_DISCOVERY_LOOKBACK_DAYS limits that scan, 0 = full history. */
export async function discoverTokens(wallet: string): Promise<{ tokens: string[]; complete: boolean; lookbackDays?: number; source: "explorer" | "known" | "sqd" }> {
  const w = wallet.toLowerCase();
  if ((process.env.TOKEN_DISCOVERY_SOURCE ?? "auto") !== "sqd") {
    const listed = await discoverViaExplorer(w);
    return { tokens: [...new Set([...KNOWN_TOKEN_ADDRESSES, ...(listed ?? [])])], complete: true, source: listed ? "explorer" : "known" };
  }
  const file = path.join(CACHE_DIR, `tokens_${w}.json`);
  let state: DiscoveryState = { tokens: [], lastBlock: -1 };
  try { state = JSON.parse(await fs.readFile(file, "utf8")); } catch { /* first scan */ }
  const head = await sqdHead();
  let complete = true;
  const lookbackDays = Number(process.env.TOKEN_DISCOVERY_LOOKBACK_DAYS ?? 0);
  if (state.lastBlock < 0 && lookbackDays > 0) state.lastBlock = Math.max(-1, head - lookbackDays * 86_400 - 1);
  if (state.lastBlock < head) {
    const res = await streamCells("incoming", w, state.lastBlock + 1, head);
    const set = new Set(state.tokens);
    for (const b of res.blocks) for (const lg of b.logs ?? []) if (lg.topics.length === 3) set.add(lg.address.toLowerCase());
    state = { tokens: [...set], lastBlock: res.reached };
    complete = res.complete;
    try {
      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(file, JSON.stringify(state));
    } catch { /* cache is best-effort */ }
  }
  return { tokens: state.tokens, complete, source: "sqd", ...(lookbackDays > 0 ? { lookbackDays } : {}) };
}