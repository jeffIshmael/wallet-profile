// FILE: lib/celoChain.ts
// Celo reads over a public RPC (free): token metadata, balances, prices, contract checks, token discovery.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createPublicClient, http, erc20Abi } from "viem";
import { celo } from "viem/chains";
import { KNOWN_TOKEN_ADDRESSES } from "./knownTokens.js";

export const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const KNOWN_SET = new Set(KNOWN_TOKEN_ADDRESSES);

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
  const t = `${symbol} ${name}`.toLowerCase();
  return symbol.length > 16 || /https?:|www\.|\.com|\.io|\.xyz|claim|visit|airdrop|reward/.test(t);
}

// Letters from other alphabets that look like Latin ones. Scam tokens use them to copy "cUSD" and friends.
const CONFUSABLE: Record<string, string> = {
  "\u0405": "S", "\u0455": "s", "\u0410": "A", "\u0430": "a", "\u0415": "E", "\u0435": "e", "\u041E": "O", "\u043E": "o",
  "\u0420": "P", "\u0440": "p", "\u0421": "C", "\u0441": "c", "\u0425": "X", "\u0445": "x", "\u0406": "I", "\u0456": "i",
  "\u0423": "Y", "\u0443": "y", "\u039F": "O", "\u03BF": "o", "\u0391": "A", "\u0395": "E", "\u0399": "I", "\u039D": "N",
};
const foldSymbol = (s: string) => [...s].map((ch) => CONFUSABLE[ch] ?? ch).join("").toLowerCase().replace(/[^a-z0-9$]/g, "");
/** Symbols nobody should be able to reuse. Only the contracts in KNOWN_TOKENS may carry them. */
const PROTECTED = new Set(["usdc", "usdt", "cusd", "usdm", "ceur", "celo", "usdglo", "creal", "ckes"]);

/** Returns address -> reason for tokens that look like spam or impersonation. Tokens in KNOWN_TOKENS are never flagged.
 *  Rules: lookalike or non-Latin characters, copying a protected symbol from another contract, the same symbol on two or
 *  more unknown contracts in one wallet (airdrop farms), and the keyword check in looksSpam(). */
export function flagSpam(tokens: Array<{ address: string; symbol: string; name: string }>): Map<string, string> {
  const out = new Map<string, string>();
  const bySymbol = new Map<string, string[]>();
  for (const t of tokens) {
    if (KNOWN_SET.has(t.address.toLowerCase())) continue;
    const f = foldSymbol(t.symbol);
    bySymbol.set(f, [...(bySymbol.get(f) ?? []), t.address.toLowerCase()]);
  }
  for (const t of tokens) {
    const a = t.address.toLowerCase();
    if (KNOWN_SET.has(a)) continue;
    const f = foldSymbol(t.symbol);
    if (/[^\x20-\x7E]/.test(`${t.symbol}${t.name}`)) out.set(a, "non-standard characters in the name or symbol");
    else if (PROTECTED.has(f)) out.set(a, "copies the symbol of a well-known token");
    else if ((bySymbol.get(f)?.length ?? 0) >= 2) out.set(a, "same symbol on several contracts");
    else if (looksSpam(t.symbol, t.name)) out.set(a, "spam keywords");
    if (out.get(a) === "non-standard characters in the name or symbol" && PROTECTED.has(f)) out.set(a, "impersonates a well-known token");
  }
  return out;
}

export async function getBalances(wallet: string, tokenList: string[], blockNumber?: bigint) {
  const tokens = [...new Set(tokenList.map((a) => a.toLowerCase()))].filter((a) => /^0x[0-9a-f]{40}$/.test(a)); // one malformed address would fail the whole batch
  const w = wallet as `0x${string}`;
  const native = await celoClient.getBalance({ address: w, ...(blockNumber !== undefined ? { blockNumber } : {}) });
  const out = new Map<string, bigint>();
  for (let i = 0; i < tokens.length; i += 200) {
    const chunk = tokens.slice(i, i + 200);
    const callArgs: any = {
      contracts: chunk.map((a) => ({ address: a as `0x${string}`, abi: erc20Abi, functionName: "balanceOf", args: [w] })),
      allowFailure: true,
      ...(blockNumber !== undefined ? { blockNumber } : {}),
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

/** Token contracts to check for a wallet: the built-in list of known Celo tokens plus whatever the Celo
 *  explorer says the wallet holds in one request, then balances are read directly from the public node.
 *  If the explorer is unreachable, the known token list is checked. */
export async function discoverTokens(wallet: string): Promise<{ tokens: string[]; complete: boolean; source: "explorer" | "known" }> {
  const w = wallet.toLowerCase();
  const listed = await discoverViaExplorer(w);
  return { tokens: [...new Set([...KNOWN_TOKEN_ADDRESSES, ...(listed ?? [])])], complete: true, source: listed ? "explorer" : "known" };
}