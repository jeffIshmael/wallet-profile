import type { SmartWalletClientType } from "@privy-io/react-auth/smart-wallets";
import type { EIP1193Provider, Hex } from "viem";

type TxParams = {
  from?: string;
  to?: string;
  data?: string;
  value?: string;
  gas?: string;
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  chainId?: string | number;
  type?: string | number;
};

type ProviderRequestArgs = {
  method: string;
  params?: readonly unknown[];
};

export const SMART_WALLET_NOT_READY =
  "Smart wallet is still initializing. Wait a few seconds and try again. If this persists, enable smart wallets and a Celo paymaster in the Privy Dashboard.";

/** Route embedded-wallet sends through the Privy smart wallet (sponsored gas). */
export function createPrivyEmbeddedProvider(
  baseProvider: EIP1193Provider,
  smartWalletClient: SmartWalletClientType | undefined
): EIP1193Provider {
  const request = (async (args: ProviderRequestArgs) => {
    if (args.method === "eth_sendTransaction") {
      if (!smartWalletClient) {
        throw new Error(SMART_WALLET_NOT_READY);
      }

      const params = (args.params?.[0] ?? {}) as TxParams;
      if (!params.to) {
        throw new Error("Transaction is missing a recipient address.");
      }

      const hash = await smartWalletClient.sendTransaction(
        {
          to: params.to as Hex,
          data: (params.data as Hex | undefined) ?? "0x",
          value: params.value ? BigInt(params.value) : 0n,
          type: "legacy"
        },
        { uiOptions: { showWalletUIs: false } }
      );

      return hash;
    }

    return baseProvider.request(args as Parameters<EIP1193Provider["request"]>[0]);
  }) as EIP1193Provider["request"];

  return {
    ...baseProvider,
    request,
    on: baseProvider.on?.bind(baseProvider),
    removeListener: baseProvider.removeListener?.bind(baseProvider)
  };
}
