import {
  createWalletClient,
  custom,
  type Address,
  type EIP1193Provider,
  type Hash,
  type Hex
} from "viem";
import { celo } from "@/lib/chains/celo";
import { MINIPAY_FEE_CURRENCY } from "@/lib/minipay/constants";
import type { PreferredStablecoin } from "@/lib/minipay/stablecoins";

type MiniPayTxRequest = {
  account: Address;
  to: Address;
  data?: Hex;
  value?: bigint;
  /** Stablecoin symbol used for fee abstraction (USDm, USDC, USDT). Defaults to USDm. */
  feeToken?: keyof typeof MINIPAY_FEE_CURRENCY;
};

/** MiniPay requires legacy transactions and stablecoin feeCurrency (CIP-64). */
export async function sendMiniPayTransaction(
  provider: EIP1193Provider,
  request: MiniPayTxRequest
): Promise<Hash> {
  const feeToken = request.feeToken ?? "USDm";
  const feeCurrency = MINIPAY_FEE_CURRENCY[feeToken] ?? MINIPAY_FEE_CURRENCY.USDm;

  const walletClient = createWalletClient({
    chain: celo,
    transport: custom(provider)
  });

  return walletClient.sendTransaction({
    account: request.account,
    to: request.to,
    data: request.data,
    value: request.value ?? 0n,
    type: "legacy",
    feeCurrency
  });
}

export function feeTokenFromPreferred(preferred: PreferredStablecoin | null): keyof typeof MINIPAY_FEE_CURRENCY {
  if (!preferred) return "USDm";
  if (preferred.symbol in MINIPAY_FEE_CURRENCY) {
    return preferred.symbol as keyof typeof MINIPAY_FEE_CURRENCY;
  }
  return "USDm";
}
