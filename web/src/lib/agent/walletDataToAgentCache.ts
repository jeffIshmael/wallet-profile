import type { WalletData } from "@/types/walletData";

/** Map dashboard WalletData into the agent's in-memory onchain cache (no RPC calls). */
export function walletDataToAgentCachePayload(data: WalletData) {
  const transactions = data.transactions.map((tx) => ({
    hash: tx.hash,
    chain: "celo",
    timestamp: tx.timestamp,
    type: tx.direction === "Incoming" ? "inflow" : "outflow",
    amountUsd: tx.amount,
    amountToken: tx.amountToken,
    token: tx.token,
    counterparty: tx.recipient
  }));

  return {
    walletAddress: data.walletAddress.toLowerCase(),
    ens: data.ens,
    walletAgeMonths: data.walletAgeMonths,
    firstTransaction: data.firstTransaction,
    lastTransaction: data.lastTransaction,
    stablecoinBalance: data.portfolio.stablecoinBalance,
    volatileBalance: data.portfolio.volatileBalance,
    defiExposure: data.portfolio.defiExposure,
    nftExposure: data.portfolio.nftExposure,
    nftCount: data.portfolio.nftCount,
    protocols: [] as string[],
    tokens: data.tokens.map((t) => ({
      address: "",
      symbol: t.symbol,
      name: t.name,
      balance: t.balance,
      usdValue: t.usdValue,
      isStable: t.isStable,
      isDefi: false
    })),
    celoPrice: data.celoPrice,
    transactions
  };
}

export function serializeWalletDataForAgent(data: WalletData): string {
  return JSON.stringify(walletDataToAgentCachePayload(data));
}
