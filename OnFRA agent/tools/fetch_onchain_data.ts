// we are first focusing on celo first
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { 
  getWalletBalances, 
  getWalletAgeMonths, 
  getWalletTransactions, 
  getWalletFirstAndLastTransactions,
  getEnsName, 
  getNftExposure,
  fullOnchainDataCache,
  TransactionDetails
} from "../lib/getWalletDetails.js";

export interface OnchainData {
  walletAddress: string;
  ens: string | null;
  walletAgeMonths: number;
  firstTransaction: TransactionDetails | null;
  lastTransaction: TransactionDetails | null;
  stablecoinBalance: number;
  volatileBalance: number;
  defiExposure: number;
  nftExposure: number;
  nftCount: number;
  protocols: string[];
}

export const fetchOnchainData = tool(
  async ({ walletAddress }) => {
    const address = walletAddress.toLowerCase();

    const warmed = fullOnchainDataCache.get(address);
    if (
      warmed?.walletAgeMonths !== undefined &&
      warmed?.stablecoinBalance !== undefined &&
      warmed?.firstTransaction !== undefined
    ) {
      console.log("Using warmed onchain cache for wallet:", address);
      const data: OnchainData = {
        walletAddress,
        ens: warmed.ens ?? null,
        walletAgeMonths: warmed.walletAgeMonths,
        firstTransaction: warmed.firstTransaction ?? null,
        lastTransaction: warmed.lastTransaction ?? null,
        stablecoinBalance: warmed.stablecoinBalance,
        volatileBalance: warmed.volatileBalance,
        defiExposure: warmed.defiExposure,
        nftExposure: warmed.nftExposure,
        nftCount: warmed.nftCount ?? 0,
        protocols: warmed.protocols ?? []
      };
      return JSON.stringify(data, null, 2);
    }

    console.log("Fetching onchain data for wallet address:", address);

    // Fetch ENS, Wallet Age, Balances, and NFT Exposure in parallel!
    const [ens, walletAgeMonths, balances, nft] = await Promise.all([
      getEnsName(address),
      getWalletAgeMonths(address),
      getWalletBalances(address),
      getNftExposure(address)
    ]);
    console.log("ENS:", ens);
    console.log("Wallet Age:", walletAgeMonths);
    console.log("Balances:", balances);
    console.log("NFT:", nft);

    // Fetch First & Last transactions quickly in parallel
    const { firstTransaction, lastTransaction } = await getWalletFirstAndLastTransactions(address, balances.celoPrice);
    console.log("First Transaction:", firstTransaction);
    console.log("Last Transaction:", lastTransaction); 

    // Compile list of unique protocols based on balances and NFTs
    const protocolSet = new Set<string>();
    for (const t of balances.tokens) {
      if (t.isDefi) {
        if (t.symbol.toUpperCase().includes("AAVE") || t.symbol.toUpperCase().startsWith("A") || t.symbol.toUpperCase().startsWith("AM")) {
          protocolSet.add("Aave");
        } else if (t.name.toLowerCase().includes("ubeswap")) {
          protocolSet.add("Ubeswap");
        }
      }
    }
    if (nft.nftCount > 0) {
      protocolSet.add("OpenSea");
    }
    const protocols = Array.from(protocolSet);

    // Build complete data object (without the bulky transactions array)
    const data: OnchainData = {
      walletAddress,
      ens,
      walletAgeMonths,
      firstTransaction,
      lastTransaction,
      stablecoinBalance: balances.stablecoinBalance,
      volatileBalance: balances.volatileBalance,
      defiExposure: balances.defiExposure,
      nftExposure: nft.nftExposure,
      nftCount: nft.nftCount,
      protocols,
    };

    // Cache the basic data object internally for other scoring tools
    const cached = fullOnchainDataCache.get(address) || {};
    fullOnchainDataCache.set(address, { ...cached, ...data });

    return JSON.stringify(data, null, 2);
  },
  {
    name: "fetch_onchain_data",
    description: "Fetches wallet overview metadata including balances, protocols, age, and first/last transactions. Required input is walletAddress.",
    schema: z.object({
      walletAddress: z.string().describe("The Ethereum/EVM wallet address to fetch data for (starts with 0x)"),
    }),
  }
);

// fetchWalletTransactionsTool
export const fetchWalletTransactions = tool(
  async ({ walletAddress, months = 3 }) => {
    const address = walletAddress.toLowerCase();
    const warmed = fullOnchainDataCache.get(address);
    const celoPrice = warmed?.celoPrice ?? (await getWalletBalances(address)).celoPrice;
    const transactions = await getWalletTransactions(address, celoPrice, months);
    
    // Calculate flow summary
    let totalInflowUsd = 0;
    let totalOutflowUsd = 0;
    for (const tx of transactions) {
      if (tx.type === "inflow") totalInflowUsd += tx.amountUsd;
      else totalOutflowUsd += tx.amountUsd;
    }

    const flowSummary = {
      walletAddress: address,
      transactionCount: transactions.length,
      timeframeMonths: months,
      threeMonthInflowUsd: parseFloat(totalInflowUsd.toFixed(2)),
      threeMonthOutflowUsd: parseFloat(totalOutflowUsd.toFixed(2)),
      threeMonthNetFlowUsd: parseFloat((totalInflowUsd - totalOutflowUsd).toFixed(2)),
      transactions: transactions.slice(0, 15) // Limit to 15 transactions in tool output to avoid LLM context flooding
    };

    // Cache the transactions list under fullOnchainDataCache for analytical tools
    const cached = fullOnchainDataCache.get(address) || {};
    fullOnchainDataCache.set(address, { ...cached, transactions });

    return JSON.stringify(flowSummary, null, 2);
  },
  {
    name: "fetch_wallet_transactions",
    description: "Fetches a cash flow statement (inflow/outflow/net flow metrics and list of transactions) for a wallet over a specified number of months (default: 3).",
    schema: z.object({
      walletAddress: z.string().describe("The Ethereum/EVM wallet address to fetch transactions for (starts with 0x)"),
      months: z.number().optional().describe("The number of months of history to fetch (e.g. 1, 3, 6, 12). Default is 3."),
    }),
  }
);

// fetchWalletProtocolsTool
export const fetchWalletProtocols = tool(
  async ({ walletAddress }) => {
    const address = walletAddress.toLowerCase();
    
    // Fetch dependencies in parallel
    const [balances, nft] = await Promise.all([
      getWalletBalances(address),
      getNftExposure(address)
    ]);
    const transactions = await getWalletTransactions(address, balances.celoPrice);
    
    const protocolSet = new Set<string>();
    for (const tx of transactions) {
      if (tx.protocol) protocolSet.add(tx.protocol);
    }
    for (const t of balances.tokens) {
      if (t.isDefi) {
        if (t.symbol.toUpperCase().includes("AAVE") || t.symbol.toUpperCase().startsWith("A") || t.symbol.toUpperCase().startsWith("AM")) {
          protocolSet.add("Aave");
        } else if (t.name.toLowerCase().includes("ubeswap")) {
          protocolSet.add("Ubeswap");
        }
      }
    }
    if (nft.nftCount > 0) protocolSet.add("OpenSea");
    
    return JSON.stringify({
      walletAddress,
      protocols: Array.from(protocolSet)
    }, null, 2);
  },
  {
    name: "fetch_wallet_protocols",
    description: "Fetches the list of DeFi/NFT protocols that the wallet address has interacted with on Celo. Required input is walletAddress.",
    schema: z.object({
      walletAddress: z.string().describe("The Ethereum/EVM wallet address to fetch protocols for (starts with 0x)"),
    }),
  }
);
