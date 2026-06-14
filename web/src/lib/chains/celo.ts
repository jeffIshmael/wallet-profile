import { chainConfig } from "viem/celo";
import { defineChain } from "viem";

/** Celo mainnet — local definition avoids bundling all viem/chains (tempo, etc.) on the client. */
export const celo = defineChain({
  ...chainConfig,
  id: 42_220,
  name: "Celo",
  nativeCurrency: {
    decimals: 18,
    name: "CELO",
    symbol: "CELO"
  },
  rpcUrls: {
    default: { http: ["https://forno.celo.org"] }
  },
  blockExplorers: {
    default: {
      name: "Celo Explorer",
      url: "https://celoscan.io",
      apiUrl: "https://api.celoscan.io/api"
    }
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 13_112_599
    }
  },
  testnet: false
});
