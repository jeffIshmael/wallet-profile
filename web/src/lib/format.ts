export function truncateAddress(address: string, start = 6, end = 4) {
  if (address.length <= start + end) return address;
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

export function formatUtc(timestamp: string) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  return `${formatter.format(new Date(timestamp)).replace(",", "")} `;
}

export function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

export function moneyPrecise(value: number) {
  return `$${value.toFixed(2)}`;
}

export function daysSince(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month ago" : `${months} months ago`;
}

export function formatWalletAge(months: number) {
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return remainingMonths === 1 ? "1 Month" : `${remainingMonths} Months`;
  }

  const yearLabel = years === 1 ? "1 Year" : `${years} Years`;
  if (remainingMonths === 0) return yearLabel;

  const monthLabel = remainingMonths === 1 ? "1 Month" : `${remainingMonths} Months`;
  return `${yearLabel} ${monthLabel}`;
}

export function formatLocalDateTime(timestamp: string) {
  const date = new Date(timestamp);
  const datePart = date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  return { datePart, timePart };
}

export function formatTxAmountUsd(value: number) {
  const abs = Math.abs(value);
  if (abs > 0 && abs < 0.001) return "< $0.001";
  const formatted = abs.toFixed(3);
  if (Number(formatted) === 0) return "$0.000";
  return `$${formatted}`;
}

export function formatTxAmountToken(value: number, token: string) {
  const abs = Math.abs(value);
  if (abs > 0 && abs < 0.0001) return `< 0.0001 ${token}`;
  const formatted = abs.toFixed(4);
  if (Number(formatted) === 0) return `0.0000 ${token}`;
  return `${formatted} ${token}`;
}

export function formatTokenBalance(balance: number, symbol: string) {
  const displaySymbol = symbol === "CELO" ? "Celo" : symbol;
  const amount =
    balance >= 1000
      ? balance.toLocaleString("en-US", { maximumFractionDigits: 2 })
      : parseFloat(balance.toPrecision(3)).toString();
  return `${amount} ${displaySymbol}`;
}

export function getFinancialHealthLabel(score: number) {
  if (score >= 71) return "Excellent Financial Health";
  if (score >= 41) return "Healthy Financial Position";
  return "Needs Improvement";
}

export function getFinancialHealthColor(score: number) {
  if (score >= 71) return "var(--color-success)";
  if (score >= 41) return "var(--color-warning)";
  return "var(--color-danger)";
}

export function getReputationTag(score: number) {
  if (score >= 90) return "Highly Trusted";
  if (score >= 75) return "Trusted";
  if (score >= 50) return "Moderate Trust";
  return "Needs More History";
}

export function getRiskCategory(
  allocation: { stablecoin: number; volatile: number; defi: number; nft: number },
  nftCount = 0
) {
  const risky = allocation.volatile + allocation.defi + allocation.nft;
  if (risky <= 30 && nftCount < 5) return "Low Risk";
  if (risky <= 55 && nftCount < 10) return "Medium Risk";
  return "High Risk";
}
