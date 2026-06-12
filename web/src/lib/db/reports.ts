import { prisma } from "@/lib/db/prisma";
import { normalizeAddress } from "@/lib/db/constants";
import { upsertWallet } from "@/lib/db/wallets";
import { buildIpfsGatewayUrl } from "@/lib/ipfs/pinata";
import type { ReportRecord } from "@/types/reportRecord";

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

function serializeReport(report: {
  id: string;
  onchainReportId: string;
  reportHash: string;
  transactionHash: string;
  walletAddress: string;
  buyerAddress: string;
  financialHealthScore: number;
  reputationScore: number;
  loanCapacity: string;
  attestation: string;
  createdAt: Date;
}): ReportRecord {
  return {
    id: report.id,
    onchainReportId: report.onchainReportId,
    reportId: report.onchainReportId,
    verificationCode: report.onchainReportId,
    ipfsCid: report.reportHash,
    ipfsUrl: buildIpfsGatewayUrl(report.reportHash),
    reportHash: report.reportHash,
    transactionHash: report.transactionHash,
    walletAddress: report.walletAddress,
    buyerAddress: report.buyerAddress,
    financialHealthScore: report.financialHealthScore,
    reputationScore: report.reputationScore,
    loanCapacity: report.loanCapacity,
    attestation: report.attestation,
    createdAt: report.createdAt.toISOString()
  };
}

export async function saveReport(input: SaveReportInput) {
  const walletAddress = normalizeAddress(input.walletAddress);
  await upsertWallet(walletAddress);

  const report = await prisma.report.create({
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

  return serializeReport(report);
}

export async function getReportByOnchainId(onchainReportId: string) {
  const report = await prisma.report.findUnique({
    where: { onchainReportId }
  });
  return report ? serializeReport(report) : null;
}

export async function listReportsForWallet(walletAddress: string, limit = 10) {
  const reports = await prisma.report.findMany({
    where: { walletAddress: normalizeAddress(walletAddress) },
    orderBy: { createdAt: "desc" },
    take: limit
  });
  return reports.map(serializeReport);
}

export async function listReportsForBuyer(buyerAddress: string, limit = 20) {
  const reports = await prisma.report.findMany({
    where: { buyerAddress: normalizeAddress(buyerAddress) },
    orderBy: { createdAt: "desc" },
    take: limit
  });
  return reports.map(serializeReport);
}

export async function listReportsForAddress(address: string, limit = 20) {
  const normalized = normalizeAddress(address);
  const reports = await prisma.report.findMany({
    where: {
      OR: [{ walletAddress: normalized }, { buyerAddress: normalized }]
    },
    orderBy: { createdAt: "desc" },
    take: limit
  });
  return reports.map(serializeReport);
}
