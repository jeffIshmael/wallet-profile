import type { Address, EIP1193Provider, Hash } from "viem";
import { MINIPAY_ADD_CASH_URL } from "@/lib/minipay/constants";
import {
  assertUsdtBalance,
  payUsdtViaDirectTransfer
} from "@/lib/x402/directUsdtPayment";

export function openMiniPayDeposit() {
  if (typeof window === "undefined") return;
  window.location.href = MINIPAY_ADD_CASH_URL;
}

export async function assertMiniPayUsdtBalance(
  account: Address,
  requiredUsdt: string
): Promise<{ ok: true } | { ok: false; balance: number }> {
  return assertUsdtBalance(account, requiredUsdt);
}

/** @deprecated Use payUsdtViaDirectTransfer — kept for MiniPay call sites. */
export async function payUsdtViaMiniPayTransfer(
  provider: EIP1193Provider,
  account: Address,
  payTo: Address,
  amountUsdt: string
): Promise<Hash> {
  return payUsdtViaDirectTransfer(provider, account, payTo, amountUsdt);
}
