import type { StatementPeriod } from "@/lib/statements/periodUtils";
import { getPeriodDateRange, PERIOD_LABELS } from "@/lib/statements/periodUtils";
import { truncateAddress } from "@/lib/format";

export function formatStatementDateLong(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

export function formatStatementPeriodLong(period: StatementPeriod): string {
  const { start, end } = getPeriodDateRange(period);
  return `${formatStatementDateLong(start)} – ${formatStatementDateLong(end)}`;
}

export function formatPeriodParenthetical(period: StatementPeriod): string {
  return `(${PERIOD_LABELS[period].toLowerCase()})`;
}

export function formatLedgerDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  const datePart = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return `${datePart}, ${timePart}`;
}

export function formatTokenLabel(token: string): string {
  return token === "CELO" ? "Celo" : token;
}

export function abbreviateTxHash(hash: string): string {
  if (hash.length <= 23) return hash;
  return `${hash.slice(0, 20)}...`;
}

export function abbreviateCounterparty(address: string): string {
  return truncateAddress(address, 6, 4);
}

export function formatUsd(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatDirectionLabel(direction: "Incoming" | "Outgoing"): string {
  return direction === "Incoming" ? "▼ Incoming" : "▲ Outgoing";
}

export function monthKeyFromDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}
