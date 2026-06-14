import { createThirdwebClient } from "thirdweb";
import { celo } from "thirdweb/chains";
import { facilitator, settlePayment, type ThirdwebX402Facilitator } from "thirdweb/x402";
import {
  AUTH_SCHEME,
  CHAIN,
  CHAIN_ID,
  PAYMENT_HEADER,
  PAYMENT_HEADER_ALIASES,
  PRICING,
  USDT_CELO_MAINNET
} from "@/lib/blockchain/constants";
import {
  getThirdwebClientId,
  getThirdwebSecretKey,
  getX402PayToAddress,
  isX402Configured
} from "@/lib/agent/env";

export type X402PriceTier = "external" | "report";

const TIER_AMOUNTS: Record<X402PriceTier, string> = {
  external: PRICING.externalWalletQueryUsdt,
  report: PRICING.verifiedReportUsdt
};

let cachedFacilitator: ThirdwebX402Facilitator | null | undefined;

function usdtToAtomic(amount: string): string {
  const [whole, frac = ""] = amount.split(".");
  const padded = (frac + "000000").slice(0, 6);
  return `${whole}${padded}`.replace(/^0+/, "") || "0";
}

function tierPrice(tier: X402PriceTier) {
  return {
    amount: usdtToAtomic(TIER_AMOUNTS[tier]),
    asset: {
      address: USDT_CELO_MAINNET,
      decimals: 6
    }
  };
}

function getFacilitator(): ThirdwebX402Facilitator | null {
  if (cachedFacilitator !== undefined) return cachedFacilitator;

  const secretKey = getThirdwebSecretKey();
  const payTo = getX402PayToAddress();
  if (!secretKey || !payTo) {
    cachedFacilitator = null;
    return null;
  }

  const client = createThirdwebClient({
    secretKey,
    clientId: getThirdwebClientId()
  });

  cachedFacilitator = facilitator({
    client,
    serverWalletAddress: payTo,
    waitUntil: process.env.NODE_ENV === "production" ? "confirmed" : "simulated"
  });

  return cachedFacilitator;
}

export function getPaymentHeader(req: Request): string | null {
  for (const name of [PAYMENT_HEADER, ...PAYMENT_HEADER_ALIASES]) {
    const value = req.headers.get(name);
    if (value) return value;
  }
  return null;
}

export function getTierPriceUsdt(tier: X402PriceTier): string {
  return TIER_AMOUNTS[tier];
}

export function paymentRequiredResponse(tier: X402PriceTier) {
  const priceUsdt = TIER_AMOUNTS[tier];
  return Response.json(
    {
      error: "Payment Required",
      code: "PAYMENT_REQUIRED",
      scheme: AUTH_SCHEME,
      price: usdtToAtomic(priceUsdt),
      priceUsdt,
      currency: USDT_CELO_MAINNET,
      chain: CHAIN,
      chainId: CHAIN_ID,
      paymentHeader: PAYMENT_HEADER,
      message: `This endpoint requires ${priceUsdt} USDT via x402. Retry with ${PAYMENT_HEADER} header.`,
      freeForOwnWallet: tier === "external"
    },
    { status: 402 }
  );
}

/** When x402 facilitator is not configured, allow requests in development. */
export function isPaymentEnforced(): boolean {
  return process.env.X402_ENFORCE === "true" && isX402Configured();
}

export function getX402SettlementMode(): "simulated" | "confirmed" {
  return process.env.NODE_ENV === "production" ? "confirmed" : "simulated";
}

/**
 * Settle x402 via Thirdweb facilitator.
 * Skipped entirely when `skipPayment` is true (own-wallet queries).
 */
export async function assertPayment(
  req: Request,
  tier: X402PriceTier,
  options?: { skipPayment?: boolean; skipReason?: string }
): Promise<Response | null> {
  const logPrefix = `[x402 ${tier}]`;

  if (options?.skipPayment) {
    console.log(`${logPrefix} Payment skipped (${options.skipReason ?? "free request"}).`);
    return null;
  }
  if (!isPaymentEnforced()) {
    console.log(`${logPrefix} Payment not enforced (X402_ENFORCE is off or facilitator not configured).`);
    return null;
  }

  const twFacilitator = getFacilitator();
  const payTo = getX402PayToAddress();
  if (!twFacilitator || !payTo) {
    console.warn(`${logPrefix} X402_ENFORCE is enabled but Thirdweb facilitator is not configured.`);
    return paymentRequiredResponse(tier);
  }

  const settlementMode = getX402SettlementMode();
  const priceUsdt = TIER_AMOUNTS[tier];
  const paymentHeader = getPaymentHeader(req);
  console.log(
    `${logPrefix} Settling payment: price=${priceUsdt} USDT, payTo=${payTo.slice(0, 10)}…, mode=${settlementMode}, hasPaymentHeader=${Boolean(paymentHeader)}`
  );

  const resourceUrl = new URL(req.url).toString();
  const settleStarted = Date.now();
  const result = await settlePayment({
    resourceUrl,
    method: req.method.toUpperCase(),
    paymentData: paymentHeader,
    payTo,
    network: celo,
    price: tierPrice(tier),
    facilitator: twFacilitator,
    routeConfig: {
      description: `Chainalyse ${tier}`,
      mimeType: "application/json"
    }
  });

  if (result.status === 200) {
    console.log(
      `${logPrefix} Payment settled in ${Date.now() - settleStarted}ms (mode=${settlementMode}, price=${priceUsdt} USDT).` +
        (settlementMode === "simulated"
          ? " Dev mode: no real USDT is transferred — balance will not change."
          : " Production mode: real USDT transfer confirmed.")
    );
    return null;
  }

  console.log(
    `${logPrefix} Payment required (HTTP ${result.status}) after ${Date.now() - settleStarted}ms — client must sign and retry.`
  );

  const body =
    "responseBody" in result && result.responseBody && Object.keys(result.responseBody).length > 0
      ? { code: "PAYMENT_REQUIRED", ...result.responseBody }
      : {
          error: "Payment Required",
          code: "PAYMENT_REQUIRED",
          scheme: AUTH_SCHEME,
          priceUsdt: TIER_AMOUNTS[tier],
          currency: USDT_CELO_MAINNET,
          chain: CHAIN,
          chainId: CHAIN_ID,
          paymentHeader: PAYMENT_HEADER,
          freeForOwnWallet: tier === "external"
        };

  return new Response(JSON.stringify(body), {
    status: result.status,
    headers: {
      "Content-Type": "application/json",
      ...result.responseHeaders
    }
  });
}
