import { createThirdwebClient } from "thirdweb";
import { facilitator } from "thirdweb/x402";
import { USDT_CELO_MAINNET } from "@/lib/blockchain/constants";
import {
  getGeminiApiKey,
  getThirdwebClientId,
  getThirdwebSecretKey,
  getX402PayToAddress,
  isX402Configured
} from "@/lib/agent/env";

export type IntegrationStatus = {
  configured: boolean;
  ok: boolean;
  error?: string;
};

function parseGoogleApiError(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    return parsed.error?.message ?? raw;
  } catch {
    return raw.slice(0, 240);
  }
}

export async function checkGeminiIntegration(): Promise<IntegrationStatus> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return { configured: false, ok: false, error: "GEMINI_API_KEY is not set." };
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash?key=${apiKey}`
    );
    if (!res.ok) {
      const message = await res.text();
      return { configured: true, ok: false, error: parseGoogleApiError(message) };
    }
    return { configured: true, ok: true };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      error: error instanceof Error ? error.message : "Gemini check failed."
    };
  }
}

export async function checkThirdwebIntegration(): Promise<
  IntegrationStatus & { payTo?: string; clientIdConfigured?: boolean }
> {
  const secretKey = getThirdwebSecretKey();
  const payTo = getX402PayToAddress();

  if (!secretKey) {
    return { configured: false, ok: false, error: "THIRDWEB_SECRET_KEY is not set." };
  }

  if (!payTo) {
    return {
      configured: true,
      ok: false,
      error: "Set X402_PAY_TO or REPORTER_PRIVATE_KEY for x402 settlement."
    };
  }

  try {
    const client = createThirdwebClient({
      secretKey,
      clientId: getThirdwebClientId()
    });
    const twFacilitator = facilitator({
      client,
      serverWalletAddress: payTo,
      waitUntil: "simulated"
    });
    await twFacilitator.supported({
      chainId: 42220,
      tokenAddress: USDT_CELO_MAINNET
    });

    return {
      configured: true,
      ok: true,
      payTo,
      clientIdConfigured: Boolean(getThirdwebClientId())
    };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      payTo,
      clientIdConfigured: Boolean(getThirdwebClientId()),
      error: error instanceof Error ? error.message : "Thirdweb check failed."
    };
  }
}

export async function getIntegrationsSummary() {
  const [gemini, thirdweb] = await Promise.all([
    checkGeminiIntegration(),
    checkThirdwebIntegration()
  ]);

  return {
    gemini,
    thirdweb,
    x402: {
      enforce: process.env.X402_ENFORCE === "true",
      configured: isX402Configured()
    }
  };
}
