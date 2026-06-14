"use client";

export type X402ClientConfig = {
  payTo: `0x${string}` | null;
  settlementMode: "simulated" | "confirmed";
  production: boolean;
};

let cachedConfig: X402ClientConfig | null = null;

function readEnvConfig(): X402ClientConfig | null {
  const payTo = process.env.NEXT_PUBLIC_X402_PAY_TO?.trim();
  const settlementMode = process.env.NEXT_PUBLIC_X402_SETTLEMENT_MODE?.trim().toLowerCase();

  if (!payTo?.startsWith("0x")) return null;

  return {
    payTo: payTo as `0x${string}`,
    settlementMode: settlementMode === "simulated" ? "simulated" : "confirmed",
    production: settlementMode !== "simulated"
  };
}

export async function getX402ClientConfig(): Promise<X402ClientConfig> {
  const fromEnv = readEnvConfig();
  if (fromEnv) {
    cachedConfig = fromEnv;
    return fromEnv;
  }

  if (cachedConfig) return cachedConfig;

  const response = await fetch("/api/x402/config");
  if (!response.ok) {
    throw new Error("Failed to load x402 payment configuration.");
  }

  const payload = (await response.json()) as {
    publicPayTo?: string | null;
    payTo?: string | null;
    settlementMode?: "simulated" | "confirmed";
    production?: boolean;
  };

  const address = payload.publicPayTo ?? payload.payTo;
  cachedConfig = {
    payTo: address?.startsWith("0x") ? (address as `0x${string}`) : null,
    settlementMode: payload.settlementMode ?? "confirmed",
    production: payload.production ?? payload.settlementMode === "confirmed"
  };

  return cachedConfig;
}

export function isX402ClientProduction(): boolean {
  const mode = process.env.NEXT_PUBLIC_X402_SETTLEMENT_MODE?.trim().toLowerCase();
  if (mode === "confirmed") return true;
  if (mode === "simulated") return false;
  return process.env.NODE_ENV === "production";
}
