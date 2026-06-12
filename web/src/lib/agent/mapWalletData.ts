import type { IncomeAnimalKey } from "@/data/incomeAnimals";
import type { WalletData } from "@/types/walletData";

type TxLike = {
  hash: string;
  timestamp: string;
  type: "inflow" | "outflow";
  amountUsd: number;
  amountToken?: number;
  token: string;
  counterparty?: string;
};

type DashboardBundle = {
  analysis: {
    walletAddress: string;
    ens: string | null;
    financialHealthScore: number;
    financialHealthBreakdown: WalletData["metrics"]["financialHealth"]["breakdown"];
    reputationScore: number;
    reputationCategory: string;
    reputationRationale: string;
    riskCategory: string;
    riskBreakdown: {
      stablecoinPct: number;
      volatileAssetPct: number;
      defiExposurePct: number;
      nftExposurePct: number;
    };
    incomeLabel: string;
    incomeMetrics: {
      weeklyInflowConsistency: number;
      monthlyIncomeEstimateUsd: number;
      averageInflowSizeUsd: number;
      recurringSenderPatterns: boolean;
    };
    loanRange: string;
    loanConfidence: string;
    aiDashboardSummary: string;
    aiAttestation: string;
  };
  rawData: {
    walletAgeMonths?: number;
    stablecoinBalance?: number;
    volatileBalance?: number;
    defiExposure?: number;
    nftExposure?: number;
    firstTransaction?: { hash: string; timestamp: string; token: string } | null;
    lastTransaction?: { hash: string; timestamp: string; token: string } | null;
  };
  loanData: { minLoanUsd: number; maxLoanUsd: number; confidence: string };
  tokens: WalletData["tokens"];
  celoPrice: number;
  nftCount: number;
  totalTransactions: number;
  transactions: TxLike[];
  incomeByPeriod: WalletData["incomeByPeriod"];
};

const INCOME_LABELS = new Set<IncomeAnimalKey>([
  "Stable Earner",
  "Growing Wallet",
  "Seasonal Earner",
  "Volatile Income",
  "Whale Activity",
  "Dormant Wallet"
]);

function normalizeSymbol(symbol: string) {
  const map: Record<string, string> = {
    cUSD: "USDm",
    CUSD: "USDm",
    cEUR: "EURm",
    cREAL: "BRLm",
    USDM: "USDm"
  };
  return map[symbol] ?? symbol;
}

function mergeTokens(tokens: WalletData["tokens"]) {
  const merged = new Map<string, WalletData["tokens"][number]>();

  for (const token of tokens) {
    const symbol = normalizeSymbol(token.symbol);
    const existing = merged.get(symbol);
    if (existing) {
      existing.balance += token.balance;
      existing.usdValue += token.usdValue;
    } else {
      merged.set(symbol, { ...token, symbol });
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.usdValue - a.usdValue);
}

function monthKey(date: Date) {
  return date.toLocaleString("en-US", { month: "short" });
}

function groupMonthlyFlows(transactions: TxLike[], months: number) {
  const cutoff = Date.now() - months * 30 * 24 * 60 * 60 * 1000;
  const buckets = new Map<string, { inflow: number; outflow: number }>();

  for (const tx of transactions) {
    const ts = new Date(tx.timestamp).getTime();
    if (ts < cutoff) continue;
    const key = monthKey(new Date(tx.timestamp));
    const bucket = buckets.get(key) ?? { inflow: 0, outflow: 0 };
    if (tx.type === "inflow") bucket.inflow += tx.amountUsd;
    else bucket.outflow += tx.amountUsd;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries()).map(([month, v]) => ({
    month,
    inflow: Math.round(v.inflow),
    outflow: Math.round(v.outflow)
  }));
}

function aggregateTokenFlows(transactions: TxLike[]) {
  const map = new Map<string, { name: string; inflow: number; outflow: number }>();
  for (const tx of transactions) {
    const symbol = normalizeSymbol(tx.token);
    const entry = map.get(symbol) ?? { name: symbol, inflow: 0, outflow: 0 };
    if (tx.type === "inflow") entry.inflow += tx.amountUsd;
    else entry.outflow += tx.amountUsd;
    map.set(symbol, entry);
  }
  return Array.from(map.entries()).map(([symbol, v]) => ({
    symbol,
    name: v.name,
    inflow: Math.round(v.inflow),
    outflow: Math.round(v.outflow),
    net: Math.round(v.inflow - v.outflow),
    usd: Math.round(v.inflow - v.outflow)
  }));
}

function monthLabel(date: Date) {
  return `${monthKey(date)} ${String(date.getFullYear()).slice(-2)}`;
}

function buildGrowthHistory(transactions: TxLike[], tokens: WalletData["tokens"], walletAgeMonths: number) {
  const months = Math.min(24, Math.max(6, walletAgeMonths));
  const now = new Date();
  const keys = ["USDC", "USDT", "USDm", "CELO"] as const;

  const history: Record<string, Array<{ month: string; value: number }>> = {
    All: [],
    USDC: [],
    USDT: [],
    USDm: [],
    CELO: []
  };

  const monthLabels: string[] = [];
  for (let i = months; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    monthLabels.push(monthLabel(d));
  }

  const monthlyDelta = new Map<string, Record<string, number>>();
  for (const tx of transactions) {
    const symbol = normalizeSymbol(tx.token);
    if (!keys.includes(symbol as (typeof keys)[number])) continue;
    const label = monthLabel(new Date(tx.timestamp));
    const bucket = monthlyDelta.get(label) ?? {};
    const delta = tx.type === "inflow" ? tx.amountUsd : -tx.amountUsd;
    bucket[symbol] = (bucket[symbol] ?? 0) + delta;
    monthlyDelta.set(label, bucket);
  }

  const currentBalances = Object.fromEntries(
    tokens.map((t) => [normalizeSymbol(t.symbol), t.usdValue])
  ) as Record<string, number>;

  const totalDelta = Object.fromEntries(keys.map((k) => [k, 0])) as Record<string, number>;
  for (const deltas of monthlyDelta.values()) {
    for (const key of keys) {
      totalDelta[key] += deltas[key] ?? 0;
    }
  }

  const running = Object.fromEntries(
    keys.map((key) => [key, Math.max(0, (currentBalances[key] ?? 0) - totalDelta[key])])
  ) as Record<string, number>;

  for (const label of monthLabels) {
    const deltas = monthlyDelta.get(label);
    for (const key of keys) {
      running[key] = Math.max(0, running[key] + (deltas?.[key] ?? 0));
      history[key].push({ month: label, value: parseFloat(running[key].toFixed(4)) });
    }
    const total = keys.reduce((sum, key) => sum + running[key], 0);
    history.All.push({ month: label, value: parseFloat(total.toFixed(4)) });
  }

  return history;
}

function buildStrengths(bundle: DashboardBundle): string[] {
  const { analysis, rawData } = bundle;
  const strengths: string[] = [];
  if ((rawData.walletAgeMonths ?? 0) >= 12) {
    strengths.push(`Wallet active for ${((rawData.walletAgeMonths ?? 0) / 12).toFixed(1)} years`);
  }
  if (analysis.incomeMetrics.recurringSenderPatterns) strengths.push("Recurring sender patterns detected");
  if (analysis.riskCategory === "Low") strengths.push("Low portfolio risk exposure");
  if ((rawData.stablecoinBalance ?? 0) > 100) strengths.push("Strong stablecoin holdings");
  if (bundle.totalTransactions >= 50) strengths.push("Consistent transaction history");
  if (analysis.reputationScore >= 75) strengths.push("Strong onchain reputation");
  return strengths.length ? strengths : ["Wallet activity analyzed on Celo"];
}

function buildWatchItems(bundle: DashboardBundle): string[] {
  const items: string[] = [];
  if (!bundle.analysis.ens) items.push("No ENS name registered");
  if (bundle.analysis.riskBreakdown.defiExposurePct > 20) items.push("Moderate DeFi exposure");
  if (bundle.analysis.incomeMetrics.weeklyInflowConsistency < 50) items.push("Variable income pattern");
  return items;
}

function hashCode(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).toUpperCase().padStart(16, "0");
}

export function mapBundleToWalletData(bundle: DashboardBundle): WalletData {
  const { analysis, rawData, loanData } = bundle;
  const incomeLabel = INCOME_LABELS.has(analysis.incomeLabel as IncomeAnimalKey)
    ? (analysis.incomeLabel as IncomeAnimalKey)
    : "Stable Earner";

  const tokens = mergeTokens(
    bundle.tokens.map((t) => ({
      ...t,
      symbol: normalizeSymbol(t.symbol)
    }))
  );

  const monthly1 = groupMonthlyFlows(bundle.transactions, 1);
  const monthly3 = groupMonthlyFlows(bundle.transactions, 3);
  const monthly6 = groupMonthlyFlows(bundle.transactions, 6);
  const monthly12 = groupMonthlyFlows(bundle.transactions, 12);
  const inflows6 = monthly6.reduce((s, m) => s + m.inflow, 0);
  const outflows6 = monthly6.reduce((s, m) => s + m.outflow, 0);
  const monthlyIncomeHistory = monthly6.map((m) => m.inflow);
  const highest = monthlyIncomeHistory.length ? Math.max(...monthlyIncomeHistory) : 0;
  const lowest = monthlyIncomeHistory.length ? Math.min(...monthlyIncomeHistory) : 0;
  const changePct =
    monthlyIncomeHistory.length >= 2
      ? Math.round(
          ((monthlyIncomeHistory.at(-1)! - monthlyIncomeHistory[0]) /
            Math.max(monthlyIncomeHistory[0], 1)) *
            100
        )
      : 0;

  const nftExposure = Number(rawData.nftExposure ?? 0);
  const stablecoinBalance = Number(rawData.stablecoinBalance ?? 0);
  const volatileBalance = Number(rawData.volatileBalance ?? 0);
  const defiExposure = Number(rawData.defiExposure ?? 0);
  const totalValueUsd = stablecoinBalance + volatileBalance + defiExposure + nftExposure;

  const verificationSeed = `${analysis.walletAddress}-${Date.now()}`;

  return {
    walletAddress: analysis.walletAddress,
    ens: analysis.ens,
    walletAgeMonths: Number(rawData.walletAgeMonths ?? 0),
    celoPrice: bundle.celoPrice,
    totalTransactions: bundle.totalTransactions,
    portfolio: {
      stablecoinBalance,
      volatileBalance,
      defiExposure,
      nftCount: bundle.nftCount,
      nftExposure,
      totalValueUsd: Math.round(totalValueUsd)
    },
    tokens,
    incomeByPeriod: bundle.incomeByPeriod,
    statementMonthlyFlow: {
      "1M": monthly1,
      "3M": monthly3,
      "6M": monthly6,
      "12M": monthly12
    },
    tokenFlows: aggregateTokenFlows(bundle.transactions),
    transactions: bundle.transactions.map((tx) => ({
      timestamp: tx.timestamp,
      token: normalizeSymbol(tx.token),
      amount: tx.amountUsd,
      amountToken: tx.amountToken ?? tx.amountUsd,
      direction: tx.type === "inflow" ? "Incoming" : "Outgoing",
      recipient: tx.counterparty ?? "",
      hash: tx.hash
    })),
    growthHistory: buildGrowthHistory(bundle.transactions, tokens, Number(rawData.walletAgeMonths ?? 12)),
    firstTransaction: rawData.firstTransaction ?? null,
    lastTransaction: rawData.lastTransaction ?? null,
    metrics: {
      financialHealth: {
        score: analysis.financialHealthScore,
        breakdown: analysis.financialHealthBreakdown
      },
      reputation: {
        score: analysis.reputationScore,
        category: analysis.reputationCategory,
        rationale: analysis.reputationRationale
      },
      risk: {
        category: analysis.riskCategory,
        allocation: {
          stablecoin: Math.round(analysis.riskBreakdown.stablecoinPct),
          volatile: Math.round(analysis.riskBreakdown.volatileAssetPct),
          defi: Math.round(analysis.riskBreakdown.defiExposurePct),
          nft: Math.round(analysis.riskBreakdown.nftExposurePct)
        }
      },
      incomeProfile: {
        label: incomeLabel,
        score: Math.round(analysis.incomeMetrics.weeklyInflowConsistency),
        monthlyEstimateUsd: Math.round(analysis.incomeMetrics.monthlyIncomeEstimateUsd),
        weeklyConsistency: Math.round(analysis.incomeMetrics.weeklyInflowConsistency),
        averageInflowUsd: Math.round(analysis.incomeMetrics.averageInflowSizeUsd),
        recurringSenderPatterns: analysis.incomeMetrics.recurringSenderPatterns,
        flag: ""
      },
      loanCapacity: {
        range: analysis.loanRange,
        minLoanUsd: loanData.minLoanUsd,
        maxLoanUsd: loanData.maxLoanUsd,
        scaleMaxUsd: Math.max(loanData.maxLoanUsd * 2, 5000),
        confidence: analysis.loanConfidence,
        factors: {
          incomeConsistency: Math.round(analysis.incomeMetrics.weeklyInflowConsistency),
          reputation: analysis.reputationScore,
          riskProfile: analysis.riskCategory
        }
      }
    },
    monthlyIncomeHistory,
    monthlyIncomeStats: { changePct, highest, lowest },
    cashFlow: {
      periodLabel: "6mo",
      inflows: Math.round(inflows6),
      outflows: Math.round(outflows6),
      net: Math.round(inflows6 - outflows6),
      monthly: monthly6.map((m) => ({ month: m.month, in: m.inflow, out: m.outflow }))
    },
    onfraAssessment: {
      narrative: analysis.aiDashboardSummary,
      strengths: buildStrengths(bundle),
      watchItems: buildWatchItems(bundle)
    },
    verificationCode: `WP-${hashCode(verificationSeed).slice(0, 16)}`,
    attestation: {
      hash: `0x${hashCode(analysis.aiAttestation)}`,
      paragraph: analysis.aiAttestation
    }
  };
}
