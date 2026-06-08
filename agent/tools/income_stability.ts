import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchOnchainData, fetchWalletTransactions, OnchainData } from "./fetch_onchain_data.js";
import { fullOnchainDataCache } from "../lib/getWalletDetails.js";

export interface IncomeStabilityResult {
  incomeLabel: "Stable Earner" | "Growing Wallet" | "Seasonal Earner" | "Volatile Income" | "Whale Activity" | "Dormant Wallet";
  weeklyInflowConsistency: number; // 0-100
  monthlyIncomeEstimateUsd: number;
  averageInflowSizeUsd: number;
  recurringSenderPatterns: boolean;
}

export const incomeStability = tool(
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
        console.warn("Failed to fetch transactions on-demand for income stability score:", err);
      }
    }

    const { stablecoinBalance, volatileBalance } = cachedData || data;

    const inflows = transactions.filter((t: any) => t.type === "inflow");
    const numInflows = inflows.length;

    if (numInflows === 0) {
      const result: IncomeStabilityResult = {
        incomeLabel: "Dormant Wallet",
        weeklyInflowConsistency: 0,
        monthlyIncomeEstimateUsd: 0,
        averageInflowSizeUsd: 0,
        recurringSenderPatterns: false,
      };
      return JSON.stringify(result, null, 2);
    }

    const totalInflow = inflows.reduce((sum: number, t: any) => sum + t.amountUsd, 0);
    const averageInflowSizeUsd = parseFloat((totalInflow / numInflows).toFixed(2));

    // Calculate dates
    const timestamps = inflows.map((t: any) => new Date(t.timestamp).getTime()).sort((a: number, b: number) => a - b);
    const minTime = timestamps[0];
    const maxTime = timestamps[timestamps.length - 1];
    const rangeMs = maxTime - minTime;
    const rangeDays = Math.max(1, rangeMs / (1000 * 60 * 60 * 24));
    const rangeMonths = Math.max(1, rangeDays / 30);
    const rangeWeeks = Math.max(1, rangeDays / 7);

    const monthlyIncomeEstimateUsd = parseFloat((totalInflow / rangeMonths).toFixed(2));

    // Weekly consistency
    // Count how many distinct weeks had at least one inflow
    const weekIds = new Set<string>();
    inflows.forEach((t: any) => {
      const date = new Date(t.timestamp);
      // Simple week identifier (Year-WeekNumber)
      const oneJan = new Date(date.getFullYear(), 0, 1);
      const numberOfDays = Math.floor((date.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
      const week = Math.ceil((date.getDay() + 1 + numberOfDays) / 7);
      weekIds.add(`${date.getFullYear()}-${week}`);
    });

    const activeWeeksWithInflows = weekIds.size;
    const totalPossibleWeeks = Math.ceil(rangeWeeks);
    const weeklyInflowConsistency = Math.min(100, Math.round((activeWeeksWithInflows / totalPossibleWeeks) * 100));

    // Fun Label classification
    let incomeLabel: IncomeStabilityResult["incomeLabel"] = "Volatile Income";
    const totalBalance = stablecoinBalance + volatileBalance;

    if (totalBalance > 100000 || averageInflowSizeUsd > 15000) {
      incomeLabel = "Whale Activity";
    } else if (weeklyInflowConsistency >= 75) {
      incomeLabel = "Stable Earner";
    } else if (rangeMonths >= 3 && numInflows >= 6) {
      // Check if second half average is higher than first half
      const halfIndex = Math.floor(inflows.length / 2);
      const firstHalf = inflows.slice(0, halfIndex);
      const secondHalf = inflows.slice(halfIndex);
      const firstAvg = firstHalf.reduce((sum: number, t: any) => sum + t.amountUsd, 0) / (firstHalf.length || 1);
      const secondAvg = secondHalf.reduce((sum: number, t: any) => sum + t.amountUsd, 0) / (secondHalf.length || 1);
      if (secondAvg > firstAvg * 1.2) {
        incomeLabel = "Growing Wallet";
      } else {
        incomeLabel = "Seasonal Earner";
      }
    } else if (rangeDays > 90 && numInflows <= 2) {
      incomeLabel = "Dormant Wallet";
    }

    // Recurring Sender patterns
    // (In mock data, we flag true if it's "isSalaryLike" which is represented by having stable matching inflow sizes)
    const inflowSizes = inflows.map((t: any) => Math.round(t.amountUsd / 10) * 10);
    const sizeCounts: Record<number, number> = {};
    let maxSameSize = 0;
    inflowSizes.forEach((s: number) => {
      sizeCounts[s] = (sizeCounts[s] || 0) + 1;
      if (sizeCounts[s] > maxSameSize) {
        maxSameSize = sizeCounts[s];
      }
    });

    const recurringSenderPatterns = maxSameSize >= 3 && numInflows > 5;

    const result: IncomeStabilityResult = {
      incomeLabel,
      weeklyInflowConsistency,
      monthlyIncomeEstimateUsd,
      averageInflowSizeUsd,
      recurringSenderPatterns,
    };

    return JSON.stringify(result, null, 2);
  },
  {
    name: "income_stability_analysis",
    description: "Analyses inflows of a wallet and calculates consistency, average sizes, recurring pattern flags, and assigns a financial activity category label. Accepts either onchainDataJson or walletAddress.",
    schema: z.object({
      onchainDataJson: z.string().optional().describe("The JSON string output from fetch_onchain_data"),
      walletAddress: z.string().optional().describe("The wallet address to analyze if onchainDataJson is not provided"),
    }),
  }
);
