import type { WalletData } from "@/types/walletData";

export type StatementPeriod = "1M" | "3M" | "6M" | "12M";

export const PERIOD_MONTHS: Record<StatementPeriod, number> = {
  "1M": 1,
  "3M": 3,
  "6M": 6,
  "12M": 12
};

export const PERIOD_LABELS: Record<StatementPeriod, string> = {
  "1M": "1 Month",
  "3M": "3 Months",
  "6M": "6 Months",
  "12M": "12 Months"
};

export function getPeriodCutoffMs(period: StatementPeriod): number {
  return Date.now() - PERIOD_MONTHS[period] * 30 * 24 * 60 * 60 * 1000;
}

export function getPeriodDateRange(period: StatementPeriod): { start: Date; end: Date } {
  return {
    start: new Date(getPeriodCutoffMs(period)),
    end: new Date()
  };
}

export function formatStatementDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

export function formatStatementPeriodRange(period: StatementPeriod): string {
  const { start, end } = getPeriodDateRange(period);
  return `${formatStatementDate(start)} to ${formatStatementDate(end)}`;
}

export function filterTransactionsByPeriod<T extends { timestamp: string }>(
  transactions: T[],
  period: StatementPeriod
): T[] {
  const cutoff = getPeriodCutoffMs(period);
  return transactions.filter((tx) => new Date(tx.timestamp).getTime() >= cutoff);
}

export function aggregateTokenFlowsForPeriod(
  transactions: WalletData["transactions"],
  period: StatementPeriod
): WalletData["tokenFlows"] {
  const filtered = filterTransactionsByPeriod(transactions, period);
  const map = new Map<string, { name: string; inflow: number; outflow: number }>();

  for (const tx of filtered) {
    const entry = map.get(tx.token) ?? { name: tx.token, inflow: 0, outflow: 0 };
    if (tx.direction === "Incoming") entry.inflow += tx.amount;
    else entry.outflow += tx.amount;
    map.set(tx.token, entry);
  }

  return Array.from(map.entries())
    .map(([symbol, v]) => ({
      symbol,
      name: v.name,
      inflow: Math.round(v.inflow * 100) / 100,
      outflow: Math.round(v.outflow * 100) / 100,
      net: Math.round((v.inflow - v.outflow) * 100) / 100,
      usd: Math.round((v.inflow - v.outflow) * 100) / 100
    }))
    .sort((a, b) => b.inflow + b.outflow - (a.inflow + a.outflow));
}

export function maskWalletAddress(address: string): string {
  if (address.length <= 12) return address;
  const prefix = address.slice(0, 6);
  const suffix = address.slice(-4);
  return `${prefix}${"x".repeat(Math.max(4, address.length - 10))}${suffix}`;
}
