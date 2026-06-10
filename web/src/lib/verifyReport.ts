import { mockWallet } from "@/data/mockWallet";
import {
  verifyOnchainReportByHash,
  verifyOnchainReportById
} from "@/lib/blockchain/onchainReporter";

export type VerifyResult =
  | {
      valid: true;
      walletAddress: string;
      reportId: string;
      reputationScore?: number;
      financialHealthScore?: number;
      loanCapacity?: string;
      reportHash?: string;
      publishedAt?: number;
      source: "onchain" | "mock";
    }
  | { valid: false };

function parseReportId(code: string): bigint | null {
  const match = code.trim().match(/^rep-(\d+)$/i);
  if (!match) return null;
  return BigInt(match[1]);
}

function isLikelyReportHash(code: string): boolean {
  const normalized = code.trim();
  return /^0x[a-fA-F0-9]{64}$/.test(normalized);
}

function verifyMockCode(code: string): VerifyResult {
  const normalized = code.trim().toLowerCase();
  if (!normalized) return { valid: false };

  const validCodes = [
    mockWallet.verificationCode.toLowerCase(),
    mockWallet.attestation.hash.toLowerCase(),
    mockWallet.attestation.hash.toLowerCase().replace(/^0x/, "")
  ];

  if (validCodes.includes(normalized)) {
    return {
      valid: true,
      walletAddress: mockWallet.walletAddress,
      reportId: "REP-7A30EF182A4729CB",
      source: "mock"
    };
  }

  return { valid: false };
}

export async function verifyReportCode(code: string): Promise<VerifyResult> {
  const trimmed = code.trim();
  if (!trimmed) return { valid: false };

  const reportId = parseReportId(trimmed);
  if (reportId !== null) {
    const onchain = await verifyOnchainReportById(reportId);
    if (onchain.exists && onchain.attestation) {
      return {
        valid: true,
        walletAddress: onchain.attestation.wallet,
        reportId: `REP-${reportId.toString()}`,
        reputationScore: onchain.attestation.reputationScore,
        financialHealthScore: onchain.attestation.financialHealthScore,
        loanCapacity: onchain.attestation.loanCapacity,
        reportHash: onchain.attestation.reportHash,
        publishedAt: onchain.attestation.publishedAt,
        source: "onchain"
      };
    }
  }

  if (isLikelyReportHash(trimmed)) {
    const onchain = await verifyOnchainReportByHash(trimmed);
    if (onchain.exists && onchain.attestation && onchain.reportId) {
      return {
        valid: true,
        walletAddress: onchain.attestation.wallet,
        reportId: `REP-${onchain.reportId.toString()}`,
        reputationScore: onchain.attestation.reputationScore,
        financialHealthScore: onchain.attestation.financialHealthScore,
        loanCapacity: onchain.attestation.loanCapacity,
        reportHash: onchain.attestation.reportHash,
        publishedAt: onchain.attestation.publishedAt,
        source: "onchain"
      };
    }
  }

  return verifyMockCode(trimmed);
}
