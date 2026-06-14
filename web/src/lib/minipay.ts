import { createWalletClient, custom, type EIP1193Provider } from "viem";
import { celo } from "@/lib/chains/celo";

export {
  MINIPAY_ADD_CASH_URL,
  MINIPAY_FEE_CURRENCY,
  MINIPAY_STABLES,
  MINIPAY_TX_HEADER
} from "@/lib/minipay/constants";
export { openMiniPayDeposit, payUsdtViaMiniPayTransfer } from "@/lib/minipay/payments";
export { getPreferredStablecoin, getUsdtBalance } from "@/lib/minipay/stablecoins";
export { sendMiniPayTransaction } from "@/lib/minipay/transactions";

type MiniPayProvider = EIP1193Provider & {
  isMiniPay?: boolean;
};

export function getInjectedProvider() {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: MiniPayProvider }).ethereum;
}

export function isMiniPay() {
  return getInjectedProvider()?.isMiniPay === true;
}

export async function connectInjectedWallet() {
  const provider = getInjectedProvider();
  if (!provider) {
    throw new Error("No injected wallet found.");
  }

  const walletClient = createWalletClient({
    chain: celo,
    transport: custom(provider)
  });

  const addresses = await walletClient.getAddresses();
  return addresses[0];
}
