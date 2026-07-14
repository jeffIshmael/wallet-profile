import {
  assertMiniPayTransferPayment,
  getMiniPayTxHeader
} from "@/lib/x402/minipaySettlement";
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
  getX402PayToAddress,
  getX402SettlementMode,
  isX402Enforced
} from "@/lib/agent/env";

export type X402PriceTier = "external" | "report";

const TIER_AMOUNTS: Record<X402PriceTier, string> = {
  external: PRICING.externalWalletQueryUsdt,
  report: PRICING.verifiedReportUsdt
};

function usdtToAtomic(amount: string): string {
  const [whole, frac = ""] = amount.split(".");
  const padded = (frac + "000000").slice(0, 6);
  return `${whole}${padded}`.replace(/^0+/, "") || "0";
}

function decodePaymentRequiredError(
  responseHeaders?: Record<string, string>
): string | null {
  const encoded =
    responseHeaders?.["PAYMENT-REQUIRED"] ?? responseHeaders?.["payment-required"] ?? responseHeaders?.["Payment-Required"];
  if (!encoded) return null;
  try {
    const rawBytes = Buffer.from(encoded, "base64");
    const json = JSON.parse(rawBytes.toString("utf8")) as {
      error?: string;
      message?: string;
    };
    return json.error ?? json.message ?? null;
  } catch {
    return null;
  }
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

/** When x402 facilitator is not configured, allow requests (X402_ENFORCE off). */
export function isPaymentEnforced(): boolean {
  return isX402Enforced();
}

export { getX402SettlementMode } from "@/lib/agent/env";

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

  const payTo = getX402PayToAddress();
  if (!payTo) {
    console.warn(`${logPrefix} X402_ENFORCE is enabled but payout address is not configured.`);
    return paymentRequiredResponse(tier);
  }

  const directTransferTx = getMiniPayTxHeader(req);
  if (directTransferTx) {
    const verified = await assertMiniPayTransferPayment(req, tier);
    if (verified) {
      console.log(
        `${logPrefix} Direct USDT transfer verified on Celo (${directTransferTx.slice(0, 12)}…).`
      );
      return null;
    }
    console.warn(
      `${logPrefix} Direct transfer verification failed for ${directTransferTx.slice(0, 12)}… — check payer, amount, and payTo.`
    );
    return paymentRequiredResponse(tier);
  }

  const settlementMode = getX402SettlementMode();
  const priceUsdt = TIER_AMOUNTS[tier];
  const paymentHeader = getPaymentHeader(req);

  if (!paymentHeader) {
    console.log(`${logPrefix} No payment header found. Returning 402 Payment Required.`);
    return paymentRequiredResponse(tier);
  }

  if (settlementMode === "simulated") {
    console.log(
      `${logPrefix} Payment settled (simulated mode — no real USDT is transferred, hasPaymentHeader=true, price=${priceUsdt} USDT).`
    );
    return null;
  }

  console.log(
    `${logPrefix} Settling payment: price=${priceUsdt} USDT, payTo=${payTo.slice(0, 10)}…, mode=${settlementMode}, hasPaymentHeader=true`
  );

  const settleStarted = Date.now();
  let resultStatus = 402;
  let resultHeaders: Record<string, string> = {};
  let responseBody: any = null;

  try {
    const settleResponse = await fetch("https://api.x402.celo.org/settle", {
      method: "POST",
      headers: {
        "X-API-Key": process.env.X402_API_KEY || "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        payment: paymentHeader,
        network: "celo"
      })
    });

    resultStatus = settleResponse.status;
    settleResponse.headers.forEach((value, key) => {
      resultHeaders[key] = value;
    });

    const text = await settleResponse.text();
    if (text) {
      try {
        responseBody = JSON.parse(text);
      } catch {
        // Not JSON
      }
    }
  } catch (error) {
    console.error(`${logPrefix} Error calling Celo x402 facilitator:`, error);
  }

  if (resultStatus === 200 || resultStatus === 201) {
    console.log(
      `${logPrefix} Payment settled in ${Date.now() - settleStarted}ms (price=${priceUsdt} USDT).`
    );
    return null;
  }

  const settlementError = decodePaymentRequiredError(resultHeaders);
  console.warn(
    `${logPrefix} Payment required (HTTP ${resultStatus}) after ${Date.now() - settleStarted}ms` +
      (settlementError ? ` — ${settlementError}` : " — client must sign and retry.")
  );

  const body = responseBody && typeof responseBody === "object"
    ? { code: "PAYMENT_REQUIRED", ...responseBody }
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
    status: resultStatus,
    headers: {
      "Content-Type": "application/json",
      ...resultHeaders
    }
  });
}
