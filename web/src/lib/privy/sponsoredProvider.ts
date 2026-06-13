import type { UnsignedTransactionRequest } from "@privy-io/react-auth";
import type { EIP1193Provider } from "viem";
import { CHAIN_ID } from "@/lib/blockchain/constants";

type SendTransactionFn = (
  input: UnsignedTransactionRequest,
  options?: {
    sponsor?: boolean;
    address?: string;
    uiOptions?: { showWalletUIs?: boolean };
  }
) => Promise<{ hash: string }>;

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

function parseChainId(chainId: string | number | undefined): number {
  if (typeof chainId === "number") return chainId;
  if (typeof chainId === "string") {
    return parseInt(chainId, chainId.startsWith("0x") ? 16 : 10);
  }
  return CHAIN_ID;
}

function toUnsignedTransactionRequest(params: TxParams): UnsignedTransactionRequest {
  return {
    from: params.from,
    to: params.to,
    data: params.data,
    value: params.value,
    gasLimit: params.gas ?? params.gasLimit,
    gasPrice: params.gasPrice,
    maxFeePerGas: params.maxFeePerGas,
    maxPriorityFeePerGas: params.maxPriorityFeePerGas,
    chainId: parseChainId(params.chainId),
    type: typeof params.type === "string" ? parseInt(params.type, 10) : params.type
  };
}

/** Route embedded-wallet sends through Privy with gas sponsorship enabled. */
export function createSponsoredProvider(
  baseProvider: EIP1193Provider,
  sendTransaction: SendTransactionFn,
  walletAddress: string
): EIP1193Provider {
  return {
    ...baseProvider,
    request: async (args) => {
      if (args.method === "eth_sendTransaction") {
        const params = (args.params?.[0] ?? {}) as TxParams;
        const { hash } = await sendTransaction(toUnsignedTransactionRequest(params), {
          sponsor: true,
          address: walletAddress,
          uiOptions: { showWalletUIs: false }
        });
        return hash;
      }

      return baseProvider.request(args);
    },
    on: baseProvider.on?.bind(baseProvider),
    removeListener: baseProvider.removeListener?.bind(baseProvider)
  };
}
