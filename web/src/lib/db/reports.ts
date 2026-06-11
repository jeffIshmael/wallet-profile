import { prisma } from "@/lib/db/prisma";
import { normalizeAddress } from "@/lib/db/constants";
import { upsertWallet } from "@/lib/db/wallets";

type SaveReportInput = {
  walletAddress: string;
  buyerAddress: string;
  onchainReportId: string;
  reportHash: string;
  transactionHash: string;
  financialHealthScore: number;
  reputationScore: number;
  loanCapacity: string;
  attestation: string;
};

export async function saveReport(input: SaveReportInput) {
  const walletAddress = normalizeAddress(input.walletAddress);
  await upsertWallet(walletAddress);

  return prisma.report.create({
    data: {
      walletAddress,
      buyerAddress: normalizeAddress(input.buyerAddress),
      onchainReportId: input.onchainReportId,
      reportHash: input.reportHash,
      transactionHash: input.transactionHash,
      financialHealthScore: input.financialHealthScore,
      reputationScore: input.reputationScore,
      loanCapacity: input.loanCapacity,
      attestation: input.attestation
    }
  });
}

export async function getReportByOnchainId(onchainReportId: string) {
  return prisma.report.findUnique({
    where: { onchainReportId }
  });
}

export async function listReportsForWallet(walletAddress: string, limit = 10) {
  return prisma.report.findMany({
    where: { walletAddress: normalizeAddress(walletAddress) },
    orderBy: { createdAt: "desc" },
    take: limit
  });
}
