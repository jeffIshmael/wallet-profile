import { createWalletClient, custom, type EIP1193Provider } from "viem";
import { celo } from "viem/chains";

type MiniPayProvider = EIP1193Provider & {
  isMiniPay?: boolean;
};

function getInjectedProvider() {
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

  const addresses = await walletClient.requestAddresses();
  return addresses[0];
}
