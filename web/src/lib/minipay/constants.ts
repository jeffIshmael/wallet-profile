/** MiniPay-supported stablecoins on Celo mainnet (token addresses for balances/transfers). */
export const MINIPAY_STABLES = [
  { symbol: "USDm", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", decimals: 18 },
  { symbol: "USDC", address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", decimals: 6 },
  { symbol: "USDT", address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", decimals: 6 }
] as const;

/** CIP-64 feeCurrency adapters — use only in transaction `feeCurrency`, not for balances. */
export const MINIPAY_FEE_CURRENCY: Record<string, `0x${string}`> = {
  USDm: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  USDC: "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B",
  USDT: "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72"
};

export const MINIPAY_ADD_CASH_URL = "https://link.minipay.xyz/add_cash?tokens=USDm,USDC,USDT";

/** Direct USDT transfer proof for x402 when EIP-712 signing is unavailable (MiniPay). */
export const MINIPAY_TX_HEADER = "X-MINIPAY-TX";
