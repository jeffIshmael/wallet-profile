import { PRICING } from "@/lib/blockchain/constants";

export type ApiErrorCode =
  | "INVALID_WALLET"
  | "INVALID_CALLER"
  | "MULTIPLE_WALLETS"
  | "INSUFFICIENT_BALANCE"
  | "PAYMENT_REQUIRED"
  | "BAD_REQUEST";

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  extra?: Record<string, unknown>
) {
  return Response.json({ error: message, code, ...extra }, { status });
}

export function invalidWalletError(fragment?: string) {
  return apiError(
    "INVALID_WALLET",
    fragment
      ? `"${fragment}" is not a valid wallet address. Use a full 0x address with 40 hex characters.`
      : "walletAddress must be a valid 0x-prefixed EVM address with 40 hex characters.",
    400
  );
}

export function insufficientBalanceError(balance: number, requiredUsdt: string) {
  return apiError(
    "INSUFFICIENT_BALANCE",
    `Insufficient USDT balance. You need at least ${requiredUsdt} USDT on Celo for this query, but your wallet has ${balance.toFixed(4)} USDT.`,
    402,
    {
      balanceUsdt: balance.toFixed(4),
      requiredUsdt,
      topUpHint: "Add USDT on Celo to your connected wallet, then try again."
    }
  );
}

export function paymentRequiredForExternal(requiredUsdt = PRICING.externalWalletQueryUsdt) {
  return apiError(
    "PAYMENT_REQUIRED",
    `External wallet queries cost ${requiredUsdt} USDT via x402 on Celo. Your own wallet is always free.`,
    402,
    { requiredUsdt, freeForOwnWallet: true }
  );
}
