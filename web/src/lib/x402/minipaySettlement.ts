import type { Hash } from "viem";
import { PRICING } from "@/lib/blockchain/constants";
import { getX402PayToAddress } from "@/lib/agent/env";
import { MINIPAY_TX_HEADER } from "@/lib/minipay/constants";
import { verifyUsdtTransferPayment } from "@/lib/x402/verifyTransferPayment";

const MINIPAY_CALLER_HEADER = "X-PAYMENT-CALLER";

type X402PriceTier = "external" | "report";

function tierAmount(tier: X402PriceTier): string {
  return tier === "report" ? PRICING.verifiedReportUsdt : PRICING.externalWalletQueryUsdt;
}

export function getMiniPayTxHeader(req: Request): Hash | null {
  const value = req.headers.get(MINIPAY_TX_HEADER)?.trim();
  if (value?.startsWith("0x")) return value as Hash;
  return null;
}

export function getMiniPayTxPayer(req: Request): `0x${string}` | null {
  const value = req.headers.get(MINIPAY_CALLER_HEADER)?.trim();
  if (value?.startsWith("0x")) return value as `0x${string}`;
  return null;
}

/** Verify direct USDT transfer submitted by MiniPay (no EIP-712 signature). */
export async function assertMiniPayTransferPayment(
  req: Request,
  tier: X402PriceTier
): Promise<boolean> {
  const txHash = getMiniPayTxHeader(req);
  const payer = getMiniPayTxPayer(req);
  const payTo = getX402PayToAddress();

  if (!txHash || !payer || !payTo) return false;

  const amountUsdt = tierAmount(tier);
  return verifyUsdtTransferPayment(txHash, payer, payTo, amountUsdt);
}
