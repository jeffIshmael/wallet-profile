import {
  getOpenAIApiKey,
  getX402PayToAddress,
  getX402SettlementMode,
  isX402Configured,
  isX402Enforced
} from "@/lib/agent/env";

export type IntegrationStatus = {
  configured: boolean;
  ok: boolean;
  error?: string;
};

function parseOpenAIApiError(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    return parsed.error?.message ?? raw;
  } catch {
    return raw.slice(0, 240);
  }
}

export async function checkOpenAIIntegration(): Promise<IntegrationStatus> {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    return { configured: false, ok: false, error: "OPENAI_API_KEY is not set." };
  }

  try {
    const res = await fetch(
      `https://api.openai.com/v1/models`, {
        headers: { Authorization: `Bearer ${apiKey}` }
      }
    );
    if (!res.ok) {
      const message = await res.text();
      return { configured: true, ok: false, error: parseOpenAIApiError(message) };
    }
    return { configured: true, ok: true };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      error: error instanceof Error ? error.message : "OpenAI check failed."
    };
  }
}

export async function checkX402Integration(): Promise<
  IntegrationStatus & { payTo?: string; apiKeyConfigured?: boolean }
> {
  const apiKey = process.env.X402_API_KEY?.trim();
  const payTo = getX402PayToAddress();

  if (!apiKey) {
    return { configured: false, ok: false, error: "X402_API_KEY is not set." };
  }

  if (!payTo) {
    return {
      configured: true,
      ok: false,
      error: "Set X402_PAY_TO or REPORTER_PRIVATE_KEY for x402 settlement."
    };
  }

  try {
    const res = await fetch("https://api.x402.celo.org/settle", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment: "",
        network: "celo"
      })
    });

    if (res.status === 401 || res.status === 403) {
      return {
        configured: true,
        ok: false,
        payTo,
        apiKeyConfigured: true,
        error: "X402_API_KEY is invalid or unauthorized."
      };
    }

    return {
      configured: true,
      ok: true,
      payTo,
      apiKeyConfigured: true
    };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      payTo,
      apiKeyConfigured: true,
      error: error instanceof Error ? error.message : "Celo x402 facilitator unreachable."
    };
  }
}

export async function getIntegrationsSummary() {
  const [openai, x402Status] = await Promise.all([
    checkOpenAIIntegration(),
    checkX402Integration()
  ]);

  return {
    openai,
    x402Status,
    x402: {
      enforce: isX402Enforced(),
      configured: isX402Configured(),
      settlementMode: getX402SettlementMode()
    }
  };
}

