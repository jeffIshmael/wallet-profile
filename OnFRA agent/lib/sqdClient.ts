// FILE: lib/sqdClient.ts
// Thin client for the SQD portal (free, reached through the Buy gateway). Streams are NDJSON, one block per line.
// A single request may stop early, so streamRange() loops from the last block it saw until it reaches toBlock.

export const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
// One or more SQD portals, tried in turn when one is overloaded. Example:
//   SQD_BASE_URLS=https://gateway.usebuy.ai/sqd/datasets/celo-mainnet,https://portal.sqd.dev/datasets/celo-mainnet
const BASES = (process.env.SQD_BASE_URLS ?? process.env.SQD_BASE_URL ?? "https://gateway.usebuy.ai/sqd/datasets/celo-mainnet")
  .split(",").map((b) => b.trim().replace(/\/$/, "")).filter(Boolean);
const MAX_ROUNDS = Number(process.env.SQD_MAX_ROUNDS ?? 300);
const TIMEOUT_MS = Number(process.env.SQD_TIMEOUT_MS ?? 45_000);
const RETRIES = Number(process.env.SQD_RETRIES ?? 5);
const BACKOFF_MS = Number(process.env.SQD_BACKOFF_MS ?? 700);
const CHUNK = Number(process.env.SQD_CHUNK_BLOCKS ?? 100_000);             // cache/fetch unit, in blocks
const CONCURRENCY = Math.max(1, Number(process.env.SQD_CONCURRENCY ?? 4)); // parallel cells per call
const TIME_BUDGET_MS = Number(process.env.SQD_TIME_BUDGET_MS ?? 40_000);   // 0 = no limit; stops starting new cells after this
const FRESH_MS = 60_000;                                                    // an unfinished (head) cell is reused this long

export interface SqdTx { hash: string; from: string; to?: string | null; value?: string | number; status?: string | number }
export interface SqdLog { address: string; topics: string[]; data?: string; transactionHash: string }
export interface SqdBlock { header: { number: number; timestamp: number }; transactions?: SqdTx[]; logs?: SqdLog[] }
export interface StreamResult { blocks: SqdBlock[]; reached: number; complete: boolean; rounds: number; error?: string }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET/POST against the SQD portals with exponential backoff. 429 and 5xx (including 529 "overloaded") are retried,
 *  rotating through SQD_BASE_URLS. Other 4xx answers are returned as-is. */
async function request(path: string, init?: RequestInit): Promise<Response> {
  let last: Response | undefined;
  let lastErr: unknown;
  for (let i = 0; i < RETRIES; i++) {
    const base = BASES[i % BASES.length];
    try {
      const res = await fetch(`${base}${path}`, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
      if (res.status !== 429 && res.status < 500) return res;
      last = res;
      lastErr = undefined;
      const ra = Number(res.headers.get("retry-after"));
      await sleep(Number.isFinite(ra) && ra > 0 ? Math.min(ra * 1000, 15_000) : Math.min(8_000, BACKOFF_MS * 2 ** i) + Math.random() * 300);
    } catch (e) {
      lastErr = e; // network error or timeout
      last = undefined;
      await sleep(Math.min(8_000, BACKOFF_MS * 2 ** i));
    }
  }
  if (last) return last;
  throw new Error(`SQD unreachable after ${RETRIES} attempts: ${(lastErr as Error)?.message ?? lastErr}`);
}

export async function sqdHead(): Promise<number> {
  const res = await request("/head");
  if (!res.ok) throw new Error(`SQD head failed (${res.status})`);
  return ((await res.json()) as { number: number }).number;
}

/** Block number at (or just before) a unix timestamp. Returns null if the lookup fails. */
export async function sqdBlockAtTimestamp(ts: number): Promise<number | null> {
  try {
    const res = await request(`/timestamps/${Math.floor(ts)}/block`);
    if (!res.ok) return null;
    const j = (await res.json()) as { block_number?: number };
    return typeof j.block_number === "number" ? j.block_number : null;
  } catch {
    return null;
  }
}

export async function streamRange(query: Record<string, unknown>, fromBlock: number, toBlock: number): Promise<StreamResult> {
  const blocks: SqdBlock[] = [];
  let cursor = fromBlock;
  let rounds = 0;
  let reached = fromBlock - 1;
  let error: string | undefined;
  while (cursor <= toBlock && rounds < MAX_ROUNDS) {
    let res: Response;
    try {
      res = await request("/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "evm", ...query, fromBlock: cursor, toBlock }),
      });
    } catch (e) {
      if (rounds === 0) throw e;
      error = (e as Error).message; // keep what we already have
      break;
    }
    rounds++;
    if (res.status === 204) { reached = toBlock; break; } // no data in the rest of the range
    if (!res.ok) {
      const msg = `SQD stream failed (${res.status}): ${(await res.text()).slice(0, 300)}`;
      if (blocks.length === 0 && reached < fromBlock) throw new Error(msg);
      error = msg; // later round failed: return the partial result instead of losing it
      break;
    }
    const lines = (await res.text()).split("\n").filter((l) => l.trim());
    if (lines.length === 0) { reached = toBlock; break; }
    let last = cursor - 1;
    for (const line of lines) {
      const b = JSON.parse(line) as SqdBlock;
      blocks.push(b);
      last = b.header.number;
    }
    if (last < cursor) break; // no progress, avoid looping forever
    reached = last;
    cursor = last + 1;
  }
  return { blocks, reached, complete: reached >= toBlock, rounds, ...(error ? { error } : {}) };
}

const pad = (addr: string) => "0x" + "0".repeat(24) + addr.toLowerCase().replace(/^0x/, "");

/** Everything a wallet did: transactions it sent/received, plus ERC-20 Transfer logs to or from it. */
export function walletQuery(address: string) {
  const w = address.toLowerCase();
  const p = pad(w);
  return {
    fields: {
      block: { number: true, timestamp: true },
      transaction: { hash: true, from: true, to: true, value: true, status: true },
      log: { address: true, topics: true, data: true, transactionHash: true },
    },
    transactions: [{ from: [w] }, { to: [w] }],
    logs: [{ topic0: [TRANSFER_TOPIC], topic1: [p] }, { topic0: [TRANSFER_TOPIC], topic2: [p] }],
  };
}

/** Only the token contracts that ever sent something to this wallet (used for balance discovery). */
export function incomingTokenQuery(address: string) {
  return {
    fields: { block: { number: true }, log: { address: true, topics: true } },
    logs: [{ topic0: [TRANSFER_TOPIC], topic2: [pad(address)] }],
  };
}

// ---------------------------------------------------------------------------------------------------------------
// Cell-based scanning. SQD answers about 50k blocks per request, so a 30-day window is ~50 requests in a row.
// Instead we split history into fixed cells (default 100k blocks), fetch several cells in parallel, and cache every
// finished cell. Overlapping windows (7d inside 30d, compare_periods, analyze then cash flow) reuse cells instead of
// re-scanning, and a call that runs out of time budget returns what it has; the next call continues from the cache.
// ---------------------------------------------------------------------------------------------------------------
export type StreamKind = "wallet" | "incoming";
interface Cell { blocks: SqdBlock[]; through: number; at: number }
type CellResult = { blocks: SqdBlock[]; reached: number; complete: boolean; error?: string };
const cellCache = new Map<string, Cell>();
const inflight = new Map<string, Promise<CellResult>>();

function getCell(kind: StreamKind, w: string, query: Record<string, unknown>, cellStart: number, need: number): Promise<CellResult> {
  const cellEnd = cellStart + CHUNK - 1;
  const key = `${kind}|${w}|${cellStart}`;
  const cached = cellCache.get(key);
  if (cached && cached.through >= need && (cached.through === cellEnd || Date.now() - cached.at < FRESH_MS)) {
    return Promise.resolve({ blocks: cached.blocks, reached: cached.through, complete: true });
  }
  const ik = `${key}|${need}`;
  let p = inflight.get(ik);
  if (!p) {
    p = streamRange(query, cellStart, need)
      .then((r) => {
        if (r.complete) {
          if (cellCache.size >= 3000) cellCache.delete(cellCache.keys().next().value as string);
          cellCache.set(key, { blocks: r.blocks, through: need, at: Date.now() });
        }
        return r as CellResult;
      })
      .finally(() => inflight.delete(ik));
    inflight.set(ik, p);
  }
  return p;
}

export async function streamCells(kind: StreamKind, address: string, fromBlock: number, toBlock: number): Promise<StreamResult> {
  const w = address.toLowerCase();
  const query = kind === "wallet" ? walletQuery(w) : incomingTokenQuery(w);
  const started = Date.now();
  const first = Math.floor(fromBlock / CHUNK), last = Math.floor(toBlock / CHUNK);
  const idxs: number[] = [];
  for (let i = first; i <= last; i++) idxs.push(i);

  const results: Array<(CellResult & { skipped?: boolean }) | undefined> = new Array(idxs.length);
  let next = 0;
  const worker = async () => {
    for (;;) {
      const k = next++;
      if (k >= idxs.length) return;
      if (TIME_BUDGET_MS > 0 && Date.now() - started > TIME_BUDGET_MS) { results[k] = { blocks: [], reached: -1, complete: false, skipped: true }; continue; }
      const cellStart = idxs[k] * CHUNK;
      try { results[k] = await getCell(kind, w, query, cellStart, Math.min(cellStart + CHUNK - 1, toBlock)); }
      catch (e) { results[k] = { blocks: [], reached: -1, complete: false, error: (e as Error).message }; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, idxs.length) }, worker));

  const blocks: SqdBlock[] = [];
  let reached = fromBlock - 1, contiguous = true, error: string | undefined, anyOk = false;
  idxs.forEach((idx, k) => {
    const r = results[k];
    const need = Math.min(idx * CHUNK + CHUNK - 1, toBlock);
    if (r && (r.blocks.length > 0 || r.complete || r.reached >= 0)) {   // includes partial cells: keep what we got
      anyOk = true;
      for (const b of r.blocks) if (b.header.number >= fromBlock && b.header.number <= toBlock) blocks.push(b);
      if (contiguous) { if (r.complete) reached = need; else { reached = Math.max(reached, r.reached); contiguous = false; } }
    } else contiguous = false;
    if (r?.error && !error) error = r.error;
    if (r?.skipped && !error) error = "time budget reached";
    if (r && !r.complete && r.error && !error) error = r.error;
  });
  if (!anyOk && error) throw new Error(error);
  return { blocks, reached: Math.min(reached, toBlock), complete: reached >= toBlock, rounds: idxs.length, ...(error ? { error } : {}) };
}