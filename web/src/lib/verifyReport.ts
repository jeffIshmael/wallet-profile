import {
  verifyOnchainReportByHash,
  verifyOnchainReportById
} from "@/lib/blockchain/onchainReporter";
import { ONCHAIN_REPORTER_PROXY } from "@/lib/blockchain/constants";
import {
  isValidReportId,
  normalizeReportId,
  REPORT_ID_BODY_LENGTH,
  REPORT_ID_PREFIX
} from "@/lib/reports/reportId";
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
      contractAddress?: string;
    }
  | { valid: false; reason?: "invalid_format" | "not_found" };

/** Accept REP-XXXXXXXXXX and common dashed variants like REP-SAMPLE-000001. */
export function normalizeVerificationCode(code: string): string {
  const trimmed = code.trim().toUpperCase();
  if (isValidReportId(trimmed)) return trimmed;

  const legacy = trimmed.match(/^REP-([A-Z]+)-(\d+)$/);
  if (legacy) {
    const prefix = legacy[1];
    const digits = legacy[2];
    const suffixLen = REPORT_ID_BODY_LENGTH - prefix.length;
    if (suffixLen > 0) {
      const suffix = digits.slice(-suffixLen).padStart(suffixLen, "0");
      const candidate = `${REPORT_ID_PREFIX}${prefix}${suffix}`;
      if (isValidReportId(candidate)) return candidate;
    }
  }

  return trimmed;
}

/** Whether the pasted value looks like a Chainalyse verification code. */
export function isValidVerificationCodeFormat(code: string): boolean {
  const trimmed = code.trim();
  if (!trimmed) return false;

  const upper = trimmed.toUpperCase();
  if (/^REP-[A-Z0-9]+$/.test(upper)) return true;
  if (/^REP-[A-Z]+-\d+$/.test(upper)) return true;
  return false;
}

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
  if (!trimmed) return { valid: false, reason: "invalid_format" };

  if (!isValidVerificationCodeFormat(trimmed)) {
    return { valid: false, reason: "invalid_format" };
  }

  const normalized = normalizeVerificationCode(trimmed);

  if (isValidReportId(normalized)) {
    const onchain = await verifyOnchainReportById(normalized);
    if (onchain.exists && onchain.attestation) {
      return {
        valid: true,
        walletAddress: onchain.attestation.wallet,
        reportId: normalized,
        reputationScore: onchain.attestation.reputationScore,
        financialHealthScore: onchain.attestation.financialHealthScore,
        loanCapacity: onchain.attestation.loanCapacity,
        reportHash: onchain.attestation.reportHash,
        publishedAt: onchain.attestation.publishedAt,
        source: "onchain",
        contractAddress: ONCHAIN_REPORTER_PROXY
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
        source: "onchain",
        contractAddress: ONCHAIN_REPORTER_PROXY
      };
    }
  }

  const mock = verifyMockCode(normalized);
  return mock.valid ? mock : { valid: false, reason: "not_found" };
}
