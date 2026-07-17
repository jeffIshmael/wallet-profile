import { privateKeyToAccount } from "viem/accounts";

export type X402SettlementMode = "simulated" | "confirmed";

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
}

export function getThirdwebSecretKey(): string | undefined {
  return process.env.THIRDWEB_SECRET_KEY?.trim();
}

export function getThirdwebClientId(): string | undefined {
  return process.env.THIRDWEB_CLIENT_ID?.trim();
}

/** Treasury / server wallet that receives x402 USDT payments. */
export function getX402PayToAddress(): `0x${string}` | undefined {
  const explicit = process.env.X402_PAY_TO?.trim() || process.env.NEXT_PUBLIC_X402_PAY_TO?.trim();
  if (explicit?.startsWith("0x")) return explicit as `0x${string}`;

  const reporterKey = process.env.REPORTER_PRIVATE_KEY?.trim();
  if (reporterKey?.startsWith("0x")) {
    return privateKeyToAccount(reporterKey as `0x${string}`).address;
  }

  return undefined;
}

/** Public treasury address for client-side MiniPay USDT transfers. */
export function getPublicX402PayToAddress(): `0x${string}` | undefined {
  const explicit = process.env.NEXT_PUBLIC_X402_PAY_TO?.trim();
  if (explicit?.startsWith("0x")) return explicit as `0x${string}`;

  // Server-only fallback so local dev works without duplicating the address.
  if (typeof window === "undefined") {
    return getX402PayToAddress();
  }

  return undefined;
}

/**
 * x402 settlement mode:
 * - `confirmed` — real on-chain USDT transfers (production)
 * - `simulated` — Thirdweb facilitator simulates payment (dev only)
 *
 * Set `X402_SETTLEMENT_MODE=confirmed` to run production settlement locally.
 * Defaults to `confirmed` when NODE_ENV=production, otherwise `simulated`.
 */
export function getX402SettlementMode(): X402SettlementMode {
  const explicit = process.env.X402_SETTLEMENT_MODE?.trim().toLowerCase();
  if (explicit === "confirmed" || explicit === "simulated") {
    return explicit;
  }
  return process.env.NODE_ENV === "production" ? "confirmed" : "simulated";
}

export function isX402ProductionSettlement(): boolean {
  return getX402SettlementMode() === "confirmed";
}

export function isX402Configured(): boolean {
  return Boolean(process.env.X402_API_KEY?.trim() && getX402PayToAddress());
}

export function isX402Enforced(): boolean {
  return process.env.X402_ENFORCE === "true" && isX402Configured();
}
