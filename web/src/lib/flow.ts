import type { WalletData } from "@/types/walletData";

export type Tx = WalletData["transactions"][number];
export type Timeframe = "1D" | "7D" | "1M" | "2M" | "3M" | "6M" | "1Y";
export type TokenSelection = "All" | "USDT" | "USDC" | "USDm" | "CELO";

export const TIMEFRAMES: {
  key: Timeframe;
  label: string;
  days: number;
  long: string;
  bucketDays: number;
}[] = [
  { key: "1D", label: "1D", days: 1, long: "24 hours", bucketDays: 1 / 24 },
  { key: "7D", label: "7D", days: 7, long: "7 days", bucketDays: 1 },
  { key: "1M", label: "1M", days: 30, long: "30 days", bucketDays: 1 },
  { key: "2M", label: "2M", days: 60, long: "2 months", bucketDays: 2 },
  { key: "3M", label: "3M", days: 90, long: "3 months", bucketDays: 7 },
  { key: "6M", label: "6M", days: 180, long: "6 months", bucketDays: 7 },
  { key: "1Y", label: "1Y", days: 365, long: "12 months", bucketDays: 30 }
];

export const TOKENS: TokenSelection[] = ["All", "USDT", "USDC", "USDm", "CELO"];

const DAY = 86_400_000;

export const TOKEN_COLORS: Record<string, string> = {
  USDT: "#26a17b",
  USDC: "#2775ca",
  USDm: "#f5a623",
  CELO: "#f5b862"
};

/** "Across 3 tokens", "Across 1 token", "No token activity" */
export function describeTokens(tokens: string[]): string {
  if (tokens.length === 0) return "No token activity";
  return `Across ${tokens.length} token${tokens.length === 1 ? "" : "s"}`;
}

/** Distinct tokens in a set of transactions, biggest volume first. */
export function tokensByVolume(txs: Tx[]): string[] {
  const volume = new Map<string, number>();
  for (const tx of txs) {
    volume.set(tx.token, (volume.get(tx.token) ?? 0) + (Number(tx.amount) || 0));
  }
  return [...volume.entries()].sort((a, b) => b[1] - a[1]).map(([symbol]) => symbol);
}

export type FlowTotals = {
  received: number;
  sent: number;
  net: number;
  count: number;
  /** Tokens that moved in this window, biggest volume first */
  tokens: string[];
};

/** Totals for one window ending now. windowsBack = 1 gives the window just before it. */
export function summarize(
  txs: Tx[],
  days: number,
  token: TokenSelection,
  windowsBack = 0,
  now = Date.now()
): FlowTotals {
  const end = now - windowsBack * days * DAY;
  const start = end - days * DAY;
  let received = 0;
  let sent = 0;
  const inWindow: Tx[] = [];

  for (const tx of txs) {
    if (token !== "All" && tx.token !== token) continue;
    const t = new Date(tx.timestamp).getTime();
    if (!(t > start && t <= end)) continue;
    const amount = Number(tx.amount) || 0;
    if (tx.direction === "Incoming") received += amount;
    else if (tx.direction === "Outgoing") sent += amount;
    inWindow.push(tx);
  }

  return {
    received,
    sent,
    net: received - sent,
    count: inWindow.length,
    tokens: tokensByVolume(inWindow)
  };
}

export type SeriesPoint = { label: string; received: number; sent: number };

function bucketLabel(ms: number, key: Timeframe): string {
  const d = new Date(ms);
  if (key === "1D") return `${String(d.getHours()).padStart(2, "0")}:00`;
  if (key === "1Y") return d.toLocaleDateString("en-GB", { month: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Received/sent per bucket (hours, days, weeks or months depending on the timeframe). */
export function buildSeries(
  txs: Tx[],
  tf: (typeof TIMEFRAMES)[number],
  token: TokenSelection,
  now = Date.now()
): SeriesPoint[] {
  const bucketMs = tf.bucketDays * DAY;
  const start = now - tf.days * DAY;
  const n = Math.max(1, Math.ceil((tf.days * DAY) / bucketMs));
  const points: SeriesPoint[] = Array.from({ length: n }, (_, i) => ({
    label: bucketLabel(start + i * bucketMs, tf.key),
    received: 0,
    sent: 0
  }));

  for (const tx of txs) {
    if (token !== "All" && tx.token !== token) continue;
    const t = new Date(tx.timestamp).getTime();
    if (!(t > start)) continue;
    const idx = Math.min(n - 1, Math.floor((t - start) / bucketMs));
    const amount = Number(tx.amount) || 0;
    if (tx.direction === "Incoming") points[idx].received += amount;
    else if (tx.direction === "Outgoing") points[idx].sent += amount;
  }

  return points.map((p) => ({
    ...p,
    received: Math.round(p.received * 100) / 100,
    sent: Math.round(p.sent * 100) / 100
  }));
}

/** $12,450 for big numbers, $4.20 for small ones. Always positive: callers add the sign. */
export function moneyShort(n: number): string {
  const abs = Math.abs(n);
  const digits = abs >= 1000 ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(abs);
}

export function compactUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  return `$${Math.round(n)}`;
}

export type Insight = { kind: "trend" | "wallet" | "spend" | "info"; text: string };

export function buildInsights(cur: FlowTotals, prev: FlowTotals, long: string): Insight[] {
  if (cur.count === 0) {
    return [{ kind: "info", text: `No transactions in the last ${long}. Try a longer timeframe.` }];
  }

  const out: Insight[] = [];

  if (prev.received > 0) {
    const pct = Math.round(((cur.received - prev.received) / prev.received) * 100);
    out.push({
      kind: "trend",
      text:
        pct === 0
          ? `Your income is the same as the previous ${long}.`
          : `Your income is ${pct > 0 ? "up" : "down"} ${Math.abs(pct)}% compared to the previous ${long}.`
    });
  } else if (cur.received > 0) {
    out.push({ kind: "trend", text: `You started receiving funds in the last ${long}.` });
  }

  if (cur.received > 0) {
    out.push({ kind: "wallet", text: `You received ${moneyShort(cur.received)} in the last ${long}.` });
    const rate = Math.round((cur.sent / cur.received) * 100);
    out.push({
      kind: "spend",
      text:
        rate > 100
          ? "You spent more than you received in this period."
          : `Your spending is ${rate}% of the income you received.`
    });
  } else {
    out.push({ kind: "spend", text: `You sent ${moneyShort(cur.sent)} and received nothing in this period.` });
  }

  return out.slice(0, 3);
}