import { privateKeyToAccount } from "viem/accounts";

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
  const explicit = process.env.X402_PAY_TO?.trim();
  if (explicit?.startsWith("0x")) return explicit as `0x${string}`;

  const reporterKey = process.env.REPORTER_PRIVATE_KEY?.trim();
  if (reporterKey?.startsWith("0x")) {
    return privateKeyToAccount(reporterKey as `0x${string}`).address;
  }

  return undefined;
}

export function isX402Configured(): boolean {
  return Boolean(getThirdwebSecretKey() && getX402PayToAddress());
}
