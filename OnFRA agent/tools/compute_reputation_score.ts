import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchOnchainData, fetchWalletTransactions, OnchainData } from "./fetch_onchain_data.js";
import { fullOnchainDataCache } from "../lib/getWalletDetails.js";

export interface ReputationResult {
  reputationScore: number;
  trustCategory: string;
  rationale: string;
}

export const computeReputationScore = tool(
  async ({ onchainDataJson, walletAddress }) => {
    let data: OnchainData;

    if (onchainDataJson) {
      data = JSON.parse(onchainDataJson);
    } else if (walletAddress) {
      const fetched = await fetchOnchainData.invoke({ walletAddress });
      data = JSON.parse(fetched);
    } else {
      throw new Error("Either onchainDataJson or walletAddress must be provided.");
    }

    const address = (walletAddress || data.walletAddress || "").toLowerCase();
    const cachedData = fullOnchainDataCache.get(address);
    let transactions = cachedData?.transactions || (data as any).transactions || [];

    // Fallback: If no transactions are found, fetch 3-month statement on-demand
    if (transactions.length === 0 && address) {
      try {
        const txJson = await fetchWalletTransactions.invoke({ walletAddress: address, months: 3 });
        const txData = JSON.parse(txJson);
        const cached = fullOnchainDataCache.get(address);
        transactions = cached?.transactions || txData.transactions || [];
      } catch (err) {
        console.warn("Failed to fetch transactions on-demand for reputation score:", err);
      }
    }

    const { walletAgeMonths, protocols } = cachedData || data;

    let baseRep = 50;

    // Age bonus: 1 point per month of age up to 30 points
    const ageBonus = Math.min(30, walletAgeMonths);
    baseRep += ageBonus;

    // Protocol bonus: 5 points per trusted protocol up to 15 points
    const protocolBonus = Math.min(15, protocols.length * 5);
    baseRep += protocolBonus;

    // Transaction consistency: check total transactions and frequency
    const txCount = transactions.length;
    let consistencyBonus = 0;
    if (txCount > 20) {
      consistencyBonus = 10;
    } else if (txCount > 10) {
      consistencyBonus = 5;
    }
    baseRep += consistencyBonus;

    // Flags: scam interactions, suspicious drains.
    // For mock purposes, if address contains "d" or "a" in a certain way, mock a security signal
    let flags: string[] = [];
    let penalties = 0;

    const lowerAddress = address.toLowerCase();
    if (lowerAddress.includes("bad") || lowerAddress.endsWith("0")) {
      flags.push("Suspicious protocol interactions flagged (interaction with unverified contract).");
      penalties += 25;
    }
    if (lowerAddress.includes("dead") || lowerAddress.slice(-2) === "99") {
      flags.push("Potential flashloan arbitrage / liquidation risk profile.");
      penalties += 15;
    }

    const reputationScore = Math.max(0, Math.min(100, baseRep - penalties));

    let trustCategory = "Standard Wallet";
    if (reputationScore >= 85) {
      trustCategory = "Established Wallet";
    } else if (reputationScore >= 70) {
      trustCategory = "Trusted DeFi User";
    } else if (reputationScore < 50) {
      trustCategory = "High Risk / Unverified Wallet";
    } else {
      trustCategory = "Moderate Reputation Wallet";
    }

    let rationale = "";
    if (flags.length > 0) {
      rationale = `Wallet has a reputation score of ${reputationScore}/100. It is classified as "${trustCategory}" due to: ${flags.join(" ")}`;
    } else {
      rationale = `This wallet demonstrates long-term legitimate activity across trusted protocols. Age of ${walletAgeMonths} months and interaction with ${protocols.join(", ")} indicates solid standing.`;
    }

    const result: ReputationResult = {
      reputationScore,
      trustCategory,
      rationale,
    };

    return JSON.stringify(result, null, 2);
  },
  {
    name: "compute_reputation_score",
    description: "Computes reputation score (0-100) and reputation categorization for trust. Accepts either onchainDataJson or walletAddress.",
    schema: z.object({
      onchainDataJson: z.string().optional().describe("The JSON string output from fetch_onchain_data"),
      walletAddress: z.string().optional().describe("The wallet address to analyze if onchainDataJson is not provided"),
    }),
  }
);
