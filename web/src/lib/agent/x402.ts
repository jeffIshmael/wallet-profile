import {
  AUTH_SCHEME,
  CHAIN,
  CHAIN_ID,
  PAYMENT_HEADER,
  PAYMENT_HEADER_ALIASES,
  PRICING,
  USDT_CELO_MAINNET
} from "@/lib/blockchain/constants";

export type X402PriceTier = "chat" | "analysis" | "report";

const TIER_AMOUNTS: Record<X402PriceTier, string> = {
  chat: PRICING.chatQueryUsdt,
  analysis: PRICING.externalWalletAnalysisUsdt,
  report: PRICING.verifiedReportUsdt
};

function usdtToAtomic(amount: string): string {
  const [whole, frac = ""] = amount.split(".");
  const padded = (frac + "000000").slice(0, 6);
  return `${whole}${padded}`.replace(/^0+/, "") || "0";
}

export function getPaymentHeader(req: Request): string | null {
  for (const name of [PAYMENT_HEADER, ...PAYMENT_HEADER_ALIASES]) {
    const value = req.headers.get(name);
    if (value) return value;
  }
  return null;
}

export function paymentRequiredResponse(tier: X402PriceTier) {
  const priceUsdt = TIER_AMOUNTS[tier];
  return Response.json(
    {
      error: "Payment Required",
      scheme: AUTH_SCHEME,
      price: usdtToAtomic(priceUsdt),
      priceUsdt,
      currency: USDT_CELO_MAINNET,
      chain: CHAIN,
      chainId: CHAIN_ID,
      paymentHeader: PAYMENT_HEADER,
      message: `This endpoint requires ${priceUsdt} USDT via x402. Retry with ${PAYMENT_HEADER} header.`
    },
    { status: 402 }
  );
}

/** When x402 facilitator is not configured, allow requests in development. */
export function isPaymentEnforced(): boolean {
  return process.env.X402_ENFORCE === "true" && Boolean(process.env.THIRDWEB_SECRET_KEY);
}

export function assertPayment(req: Request, tier: X402PriceTier): Response | null {
  if (!isPaymentEnforced()) return null;
  if (getPaymentHeader(req)) return null;
  return paymentRequiredResponse(tier);
}
