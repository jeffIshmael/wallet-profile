import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ANALYSIS_CACHE_TTL_MS, normalizeAddress } from "@/lib/db/constants";
import type { WalletData } from "@/types/walletData";
import { upsertWallet } from "@/lib/db/wallets";

function extractMetrics(walletData: WalletData) {
  const { metrics, portfolio } = walletData;
  return {
    financialHealthScore: metrics.financialHealth.score,
    reputationScore: metrics.reputation.score,
    reputationCategory: metrics.reputation.category,
    riskCategory: metrics.risk.category,
    incomeLabel: metrics.incomeProfile.label,
    loanRange: metrics.loanCapacity.range,
    loanConfidence: metrics.loanCapacity.confidence,
    totalValueUsd: portfolio.totalValueUsd,
    totalTransactions: walletData.totalTransactions
  };
}

export async function saveAnalysisRun(walletAddress: string, walletData: WalletData) {
  const address = normalizeAddress(walletAddress);
  await upsertWallet(address, walletData.ens);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ANALYSIS_CACHE_TTL_MS);
  const metrics = extractMetrics(walletData);

  return prisma.analysisRun.create({
    data: {
      walletAddress: address,
      ...metrics,
      walletData: walletData as unknown as Prisma.InputJsonValue,
      expiresAt
    }
  });
}

export async function getLatestAnalysisRun(walletAddress: string) {
  return prisma.analysisRun.findFirst({
    where: { walletAddress: normalizeAddress(walletAddress) },
    orderBy: { createdAt: "desc" }
  });
}

export async function getCachedWalletData(walletAddress: string): Promise<WalletData | null> {
  const run = await getLatestAnalysisRun(walletAddress);
  if (!run || run.expiresAt <= new Date()) return null;
  return run.walletData as WalletData;
}

export async function getLatestWalletData(walletAddress: string): Promise<{
  walletData: WalletData;
  createdAt: Date;
  fromCache: boolean;
} | null> {
  const run = await getLatestAnalysisRun(walletAddress);
  if (!run) return null;

  return {
    walletData: run.walletData as WalletData,
    createdAt: run.createdAt,
    fromCache: run.expiresAt > new Date()
  };
}
