import { mockWallet } from "@/data/mockWallet";

export type VerifyResult =
  | { valid: true; walletAddress: string }
  | { valid: false };

export function verifyReportCode(code: string): VerifyResult {
  const normalized = code.trim().toLowerCase();
  if (!normalized) return { valid: false };

  const validCodes = [
    mockWallet.verificationCode.toLowerCase(),
    mockWallet.attestation.hash.toLowerCase(),
    mockWallet.attestation.hash.toLowerCase().replace(/^0x/, "")
  ];

  if (validCodes.includes(normalized)) {
    return { valid: true, walletAddress: mockWallet.walletAddress };
  }

  return { valid: false };
}
