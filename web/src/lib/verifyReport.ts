import {
  verifyOnchainReportByHash,
  verifyOnchainReportById
} from "@/lib/blockchain/onchainReporter";
import { isValidReportId, normalizeReportId } from "@/lib/reports/reportId";
import {
  SAMPLE_IPFS_CID,
  SAMPLE_REPORT_ID,
  SAMPLE_WALLET_ADDRESS
} from "@/lib/reports/sampleReportConstants";

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

function normalizeIpfsCid(code: string): string {
  return code.trim().replace(/^ipfs:\/\//i, "");
}

function isLikelyIpfsCid(code: string): boolean {
  const cid = normalizeIpfsCid(code);
  if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid)) return true;
  if (/^baf[a-z2-7]{50,}$/i.test(cid)) return true;
  return false;
}

function isLikelyReportHash(code: string): boolean {
  const normalized = code.trim();
  if (isLikelyIpfsCid(normalized)) return true;
  return /^0x[a-fA-F0-9]{64}$/.test(normalized);
}

function verifyMockCode(code: string): VerifyResult {
  const normalized = code.trim().toLowerCase();
  if (!normalized) return { valid: false };

  const validCodes = [
    SAMPLE_REPORT_ID.toLowerCase(),
    SAMPLE_IPFS_CID.toLowerCase(),
    `ipfs://${SAMPLE_IPFS_CID}`.toLowerCase()
  ];

  if (validCodes.includes(normalized)) {
    return {
      valid: true,
      walletAddress: SAMPLE_WALLET_ADDRESS,
      reportId: SAMPLE_REPORT_ID,
      reportHash: SAMPLE_IPFS_CID,
      source: "mock"
    };
  }

  return { valid: false };
}

export async function verifyReportCode(code: string): Promise<VerifyResult> {
  const trimmed = code.trim();
  if (!trimmed) return { valid: false };

  if (isValidReportId(trimmed)) {
    const onchain = await verifyOnchainReportById(normalizeReportId(trimmed));
    if (onchain.exists && onchain.attestation) {
      return {
        valid: true,
        walletAddress: onchain.attestation.wallet,
        reportId: normalizeReportId(trimmed),
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
    const lookupHash = isLikelyIpfsCid(trimmed) ? normalizeIpfsCid(trimmed) : trimmed;
    const onchain = await verifyOnchainReportByHash(lookupHash);
    if (onchain.exists && onchain.attestation && onchain.reportId) {
      return {
        valid: true,
        walletAddress: onchain.attestation.wallet,
        reportId: onchain.reportId,
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
