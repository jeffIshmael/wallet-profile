import { runAnalysisChain, type DashboardOutput } from "./analysis_chain.js";
import {
  computePeriodFlow,
  fullOnchainDataCache,
  warmWalletDataCache,
  type TransactionDetails
} from "../lib/getWalletDetails.js";

export type PeriodFlow = {
  inbound: number;
  outbound: number;
  net: number;
  transactionCount: number;
};

export type DashboardBundle = {
  analysis: DashboardOutput;
  rawData: Record<string, unknown>;
  loanData: { minLoanUsd: number; maxLoanUsd: number; confidence: string };
  tokens: Array<{
    symbol: string;
    name: string;
    balance: number;
    usdValue: number;
    isStable: boolean;
  }>;
  celoPrice: number;
  nftCount: number;
  totalTransactions: number;
  transactions: TransactionDetails[];
  incomeByPeriod: Record<"1M" | "3M" | "6M" | "12M", PeriodFlow>;
};

function withTrend(current: PeriodFlow, previousNet: number): PeriodFlow & { trendPct: number } {
  const trendPct =
    previousNet === 0 ? 0 : Math.round(((current.net - previousNet) / Math.abs(previousNet)) * 100);
  return { ...current, trendPct };
}

export async function runDashboardBundle(walletAddress: string): Promise<DashboardBundle> {
  const address = walletAddress.toLowerCase();

  // Prefetch once per process unless onchain data is already cached.
  const existing = fullOnchainDataCache.get(address);
  const cached =
    existing?.transactions && existing?.tokens
      ? existing
      : await warmWalletDataCache(address, 12);
  const analysis = await runAnalysisChain(walletAddress);

  const rawData = JSON.parse(analysis.rawJson || "{}") as Record<string, unknown>;
  const loanData = JSON.parse(analysis.loanJson || "{}") as {
    minLoanUsd: number;
    maxLoanUsd: number;
    confidence: string;
  };

  const transactions12m = (cached.transactions as TransactionDetails[]) || [];
  const p1 = computePeriodFlow(transactions12m, 1);
  const p3 = computePeriodFlow(transactions12m, 3);
  const p6 = computePeriodFlow(transactions12m, 6);
  const p12 = computePeriodFlow(transactions12m, 12);

  return {
    analysis,
    rawData,
    loanData,
    tokens: (cached.tokens || [])
      .filter((t: { usdValue: number; balance: number }) => t.usdValue > 0.001 || t.balance > 0.0001)
      .sort((a: { usdValue: number }, b: { usdValue: number }) => b.usdValue - a.usdValue)
      .slice(0, 8),
    celoPrice: cached.celoPrice,
    nftCount: cached.nftCount ?? 0,
    totalTransactions: transactions12m.length || p12.transactionCount,
    transactions: transactions12m,
    incomeByPeriod: {
      "1M": withTrend(p1, 0),
      "3M": withTrend(p3, p1.net),
      "6M": withTrend(p6, p3.net),
      "12M": withTrend(p12, p6.net)
    }
  };
}
