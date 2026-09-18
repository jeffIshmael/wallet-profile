import {
  assertMiniPayTransferPayment,
  getMiniPayTxHeader
} from "@/lib/x402/minipaySettlement";
import {
  AUTH_SCHEME,
  CELOSCAN_BASE_URL,
  CHAIN,
  CHAIN_ID,
  PAYMENT_HEADER,
  PAYMENT_HEADER_ALIASES,
  PRICING,
  USDT_CELO_MAINNET
} from "@/lib/blockchain/constants";
import {
  getAttributionTag,
  getX402PayToAddress,
  getX402SettlementMode,
  isX402Enforced
} from "@/lib/agent/env";

export type X402PriceTier = "external" | "report";

export type PaymentSettlement = {
  method: "skipped" | "unenforced" | "direct-usdt" | "x402-facilitator" | "simulated";
  priceUsdt: string;
  txHash?: string;
  payTo?: string;
  attributionTag: string;
  explorerUrl?: string;
};

export type AssertPaymentResult =
  | { ok: true; settlement: PaymentSettlement }
  | { ok: false; response: Response };

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
    responseHeaders?.["PAYMENT-REQUIRED"] ??
    responseHeaders?.["payment-required"] ??
    responseHeaders?.["Payment-Required"];
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

function extractFacilitatorTxHash(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const record = body as Record<string, unknown>;
  for (const key of ["transaction", "transactionHash", "txHash", "hash"]) {
    const value = record[key];
    if (typeof value === "string" && value.startsWith("0x")) return value;
  }
  const nested = record.settlement ?? record.result;
  if (nested && typeof nested === "object") {
    return extractFacilitatorTxHash(nested);
  }
  return undefined;
}

type PaymentPayloadRecord = Record<string, unknown>;

/** Parse X-PAYMENT as JSON, base64 JSON, or legacy flat EIP-3009 fields. */
function parsePaymentPayload(header: string): PaymentPayloadRecord | null {
  const tryJson = (raw: string): PaymentPayloadRecord | null => {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === "object" ? (parsed as PaymentPayloadRecord) : null;
    } catch {
      return null;
    }
  };

  let obj = tryJson(header);
  if (!obj) {
    try {
      obj = tryJson(Buffer.from(header, "base64").toString("utf8"));
    } catch {
      obj = null;
    }
  }
  if (!obj) return null;

  // Already a PaymentPayload (v1 scheme/network or v2 accepted)
  if ("payload" in obj && ("scheme" in obj || "accepted" in obj || "x402Version" in obj)) {
    return obj;
  }

  // { signature, authorization }
  if (typeof obj.signature === "string" && obj.authorization && typeof obj.authorization === "object") {
    return {
      x402Version: 1,
      scheme: AUTH_SCHEME,
      network: CHAIN,
      payload: obj
    };
  }

  // Legacy flat EIP-3009: from/to/value/nonce/signature
  if (
    typeof obj.signature === "string" &&
    typeof obj.from === "string" &&
    typeof obj.to === "string" &&
    obj.value != null &&
    typeof obj.nonce === "string"
  ) {
    return {
      x402Version: 1,
      scheme: AUTH_SCHEME,
      network: CHAIN,
      payload: {
        signature: obj.signature,
        authorization: {
          from: obj.from,
          to: obj.to,
          value: String(obj.value),
          validAfter: String(obj.validAfter ?? "0"),
          validBefore: String(obj.validBefore ?? ""),
          nonce: obj.nonce
        }
      }
    };
  }

  return null;
}

function buildPaymentRequirements(tier: X402PriceTier, payTo: string, resource: string) {
  const priceUsdt = TIER_AMOUNTS[tier];
  return {
    scheme: AUTH_SCHEME,
    network: CHAIN,
    maxAmountRequired: usdtToAtomic(priceUsdt),
    resource,
    description: `OnFRA ${tier}`,
    mimeType: "application/json",
    payTo,
    maxTimeoutSeconds: 300,
    asset: USDT_CELO_MAINNET,
    extra: { name: "Tether USD", version: "1" }
  };
}

function settlementOk(
  method: PaymentSettlement["method"],
  priceUsdt: string,
  extras?: Partial<PaymentSettlement>
): AssertPaymentResult {
  const txHash = extras?.txHash;
  return {
    ok: true,
    settlement: {
      ...extras,
      method,
      priceUsdt,
      attributionTag: getAttributionTag(),
      payTo: extras?.payTo ?? getX402PayToAddress(),
      txHash,
      explorerUrl: txHash ? `${CELOSCAN_BASE_URL}/tx/${txHash}` : extras?.explorerUrl
    }
  };
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
  const maxAmountRequired = usdtToAtomic(priceUsdt);
  const payTo = getX402PayToAddress() ?? null;

  const accepts = [
    {
      scheme: AUTH_SCHEME,
      network: CHAIN,
      chainId: CHAIN_ID,
      maxAmountRequired,
      asset: USDT_CELO_MAINNET,
      assetSymbol: "USDT",
      payTo,
      extra: {
        name: "Tether USD",
        version: "1",
        paymentHeader: PAYMENT_HEADER,
        alternateHeaders: [...PAYMENT_HEADER_ALIASES],
        settlement: "celo-x402-facilitator",
        directTransferHeader: "X-MINIPAY-TX",
        attributionTag: getAttributionTag()
      }
    }
  ];

  return Response.json(
    {
      error: "Payment Required",
      code: "PAYMENT_REQUIRED",
      x402Version: 1,
      scheme: AUTH_SCHEME,
      network: CHAIN,
      chain: CHAIN,
      chainId: CHAIN_ID,
      asset: USDT_CELO_MAINNET,
      currency: USDT_CELO_MAINNET,
      currencySymbol: "USDT",
      price: maxAmountRequired,
      maxAmountRequired,
      priceUsdt,
      payTo,
      paymentHeader: PAYMENT_HEADER,
      alternateHeaders: [...PAYMENT_HEADER_ALIASES],
      attributionTag: getAttributionTag(),
      accepts,
      retry: {
        method: "resubmit",
        header: PAYMENT_HEADER,
        steps: [
          "Read accepts[0] (asset, maxAmountRequired, payTo, network).",
          "Sign an EIP-3009 USDT authorization (or settle via a Celo x402 client) for maxAmountRequired to payTo.",
          `Retry the same HTTP request with ${PAYMENT_HEADER} set to the payment payload.`,
          "MiniPay / direct USDT: send a tagged transfer then retry with X-MINIPAY-TX + X-PAYMENT-CALLER."
        ]
      },
      configUrl: "/api/x402/config",
      message: `This endpoint requires ${priceUsdt} USDT via x402. Retry with ${PAYMENT_HEADER} header.`,
      freeForOwnWallet: tier === "external"
    },
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": AUTH_SCHEME,
        "Payment-Required": "true"
      }
    }
  );
}

/** When x402 facilitator is not configured, allow requests (X402_ENFORCE off). */
export function isPaymentEnforced(): boolean {
  return isX402Enforced();
}

export { getX402SettlementMode } from "@/lib/agent/env";

/**
 * Settle payment via direct USDT transfer proof or Celo x402 facilitator.
 * Skipped entirely when `skipPayment` is true (own-wallet queries).
 */
export async function assertPayment(
  req: Request,
  tier: X402PriceTier,
  options?: { skipPayment?: boolean; skipReason?: string }
): Promise<AssertPaymentResult> {
  const logPrefix = `[x402 ${tier}]`;
  const priceUsdt = TIER_AMOUNTS[tier];

  if (options?.skipPayment) {
    console.log(`${logPrefix} Payment skipped (${options.skipReason ?? "free request"}).`);
    return settlementOk("skipped", "0");
  }
  if (!isPaymentEnforced()) {
    console.log(
      `${logPrefix} Payment not enforced (X402_ENFORCE is off or facilitator not configured).`
    );
    return settlementOk("unenforced", priceUsdt);
  }

  const payTo = getX402PayToAddress();
  if (!payTo) {
    console.warn(`${logPrefix} X402_ENFORCE is enabled but payout address is not configured.`);
    return { ok: false, response: paymentRequiredResponse(tier) };
  }

  const directTransferTx = getMiniPayTxHeader(req);
  if (directTransferTx) {
    const verified = await assertMiniPayTransferPayment(req, tier);
    if (verified) {
      console.log(
        `${logPrefix} Direct USDT transfer verified on Celo (${directTransferTx.slice(0, 12)}…).`
      );
      return settlementOk("direct-usdt", priceUsdt, {
        txHash: directTransferTx,
        payTo
      });
    }
    console.warn(
      `${logPrefix} Direct transfer verification failed for ${directTransferTx.slice(0, 12)}… — check payer, amount, and payTo.`
    );
    return { ok: false, response: paymentRequiredResponse(tier) };
  }

  const settlementMode = getX402SettlementMode();
  const paymentHeader = getPaymentHeader(req);

  if (!paymentHeader) {
    console.log(`${logPrefix} No payment header found. Returning 402 Payment Required.`);
    return { ok: false, response: paymentRequiredResponse(tier) };
  }

  if (settlementMode === "simulated") {
    console.log(
      `${logPrefix} Payment settled (simulated mode — no real USDT is transferred, hasPaymentHeader=true, price=${priceUsdt} USDT).`
    );
    return settlementOk("simulated", priceUsdt, { payTo });
  }

  const paymentPayload = parsePaymentPayload(paymentHeader);
  if (!paymentPayload) {
    console.warn(`${logPrefix} X-PAYMENT header is not a valid PaymentPayload (JSON or base64).`);
    return { ok: false, response: paymentRequiredResponse(tier) };
  }

  const resourceUrl = (() => {
    try {
      return new URL(req.url).pathname;
    } catch {
      return "/api";
    }
  })();
  const paymentRequirements = buildPaymentRequirements(tier, payTo, resourceUrl);
  const x402Version =
    typeof paymentPayload.x402Version === "number" ? paymentPayload.x402Version : 1;

  console.log(
    `${logPrefix} Settling payment: price=${priceUsdt} USDT, payTo=${payTo.slice(0, 10)}…, mode=${settlementMode}, x402Version=${x402Version}`
  );

  const settleStarted = Date.now();
  let resultStatus = 402;
  let resultHeaders: Record<string, string> = {};
  let responseBody: unknown = null;

  try {
    const settleResponse = await fetch("https://api.x402.celo.org/settle", {
      method: "POST",
      headers: {
        "X-API-Key": process.env.X402_API_KEY || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        x402Version,
        paymentPayload,
        paymentRequirements
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
    const txHash = extractFacilitatorTxHash(responseBody);
    console.log(
      `${logPrefix} Payment settled in ${Date.now() - settleStarted}ms (price=${priceUsdt} USDT` +
        (txHash ? `, tx=${txHash.slice(0, 12)}…` : "") +
        ")."
    );
    return settlementOk("x402-facilitator", priceUsdt, { txHash, payTo });
  }

  const settlementError = decodePaymentRequiredError(resultHeaders);
  console.warn(
    `${logPrefix} Payment required (HTTP ${resultStatus}) after ${Date.now() - settleStarted}ms` +
      (settlementError ? ` — ${settlementError}` : " — client must sign and retry.")
  );

  if (!responseBody || typeof responseBody !== "object") {
    return { ok: false, response: paymentRequiredResponse(tier) };
  }

  const body = {
    error: "Payment Required",
    code: "PAYMENT_REQUIRED",
    scheme: AUTH_SCHEME,
    network: CHAIN,
    chain: CHAIN,
    currency: USDT_CELO_MAINNET,
    currencySymbol: "USDT",
    priceUsdt: TIER_AMOUNTS[tier],
    attributionTag: getAttributionTag(),
    ...responseBody,
    payTo,
    asset: USDT_CELO_MAINNET,
    chainId: CHAIN_ID,
    paymentHeader: PAYMENT_HEADER
  };

  return {
    ok: false,
    response: new Response(JSON.stringify(body), {
      status: resultStatus >= 400 ? resultStatus : 402,
      headers: {
        "Content-Type": "application/json",
        "WWW-Authenticate": AUTH_SCHEME,
        ...resultHeaders
      }
    })
  };
}
