import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchOnchainData, fetchWalletTransactions, OnchainData } from "./fetch_onchain_data.js";
import { fullOnchainDataCache } from "../lib/getWalletDetails.js";

export interface FinancialHealthResult {
  financialHealthScore: number;
  breakdown: {
    incomeStability: number;
    savingsDiscipline: number;
    portfolioRisk: number;
    spendingDiscipline: number;
    walletMaturity: number;
    debtRiskSignals: number;
  };
}

export const computeFinancialHealth = tool(
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
        console.warn("Failed to fetch transactions on-demand for financial health score:", err);
      }
    }

    const { walletAgeMonths, stablecoinBalance, volatileBalance, protocols } = cachedData || data;

    // 1. Income Stability (0-100)
    // Based on inflow frequency and size
    const inflows = transactions.filter((t: any) => t.type === "inflow");
    let incomeStability = 50; // default
    if (inflows.length > 0) {
      // If we have recurrent inflows, score is higher. Check standard deviation or date differences
      const timestamps = inflows.map((t: any) => new Date(t.timestamp).getTime()).sort((a: any, b: any) => a - b);
      if (timestamps.length > 1) {
        const intervals: number[] = [];
        for (let i = 1; i < timestamps.length; i++) {
          intervals.push((timestamps[i] - timestamps[i - 1]) / (1000 * 60 * 60 * 24)); // in days
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        // variance of intervals
        const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
        const stdDev = Math.sqrt(variance);

        // Lower std dev relative to average interval means more consistent
        const consistencyRatio = stdDev / (avgInterval || 1);
        if (consistencyRatio < 0.2) incomeStability = 95;
        else if (consistencyRatio < 0.5) incomeStability = 80;
        else if (consistencyRatio < 1.0) incomeStability = 60;
        else incomeStability = 40;
      } else {
        incomeStability = 30; // single inflow is not very stable
      }
    } else {
      incomeStability = 10;
    }

    // 2. Savings Discipline (0-100)
    // Based on stablecoin ratio and balance retention
    const totalBalance = stablecoinBalance + volatileBalance;
    const stableRatio = totalBalance > 0 ? stablecoinBalance / totalBalance : 0;
    
    let savingsDiscipline = 50;
    if (totalBalance > 0) {
      // savings is higher if we keep stablecoins and total balance is substantial
      savingsDiscipline = Math.min(100, Math.round(stableRatio * 70 + Math.min(30, totalBalance / 200)));
    } else {
      savingsDiscipline = 10;
    }

    // 3. Portfolio Risk (0-100, inverse — lower risk = higher score)
    // Volatile assets ratio
    const volatileRatio = totalBalance > 0 ? volatileBalance / totalBalance : 0;
    const portfolioRisk = Math.round((1 - volatileRatio) * 100); // 100 if all stablecoins, 0 if all volatile assets

    // 4. Spending Discipline (0-100)
    // Inflow volume vs Outflow volume
    const totalInflow = inflows.reduce((sum: any, t: any) => sum + t.amountUsd, 0);
    const outflows = transactions.filter((t: any) => t.type === "outflow");
    const totalOutflow = outflows.reduce((sum: any, t: any) => sum + t.amountUsd, 0);

    let spendingDiscipline = 50;
    if (totalInflow > 0) {
      const outflowRatio = totalOutflow / totalInflow;
      if (outflowRatio <= 0.3) spendingDiscipline = 95;
      else if (outflowRatio <= 0.6) spendingDiscipline = 85;
      else if (outflowRatio <= 0.9) spendingDiscipline = 70;
      else if (outflowRatio <= 1.1) spendingDiscipline = 50;
      else spendingDiscipline = Math.max(10, Math.round(100 - (outflowRatio * 30)));
    }

    // 5. Wallet Maturity (0-100)
    // Age and protocol interactions
    const ageScore = Math.min(60, (walletAgeMonths / 48) * 60); // Max 60 points for age (4 years+)
    const protocolScore = Math.min(40, protocols.length * 10); // Max 40 points for protocol usage
    const walletMaturity = Math.round(ageScore + protocolScore);

    // 6. Debt / Risk Signals (0-100, inverse)
    // For mock, check if protocols include openSea/Uniswap and check for volatile transactions
    // If volatileBalance is 75% of total balance, deduct score slightly
    let debtRiskSignals = 100;
    if (volatileRatio > 0.8) {
      debtRiskSignals -= 20;
    }
    if (protocols.includes("Aave")) {
      debtRiskSignals -= 10; // some debt signals from borrowing platforms
    }

    // Weights:
    // income_stability      → 25%
    // savings_discipline    → 20%
    // portfolio_risk        → 20%
    // spending_discipline   → 15%
    // wallet_maturity       → 10%
    // debt_risk_signals     → 10%
    const score = (
      (incomeStability * 0.25) +
      (savingsDiscipline * 0.20) +
      (portfolioRisk * 0.20) +
      (spendingDiscipline * 0.15) +
      (walletMaturity * 0.10) +
      (debtRiskSignals * 0.10)
    );

    const result: FinancialHealthResult = {
      financialHealthScore: Math.round(score),
      breakdown: {
        incomeStability,
        savingsDiscipline,
        portfolioRisk,
        spendingDiscipline,
        walletMaturity,
        debtRiskSignals,
      },
    };

    return JSON.stringify(result, null, 2);
  },
  {
    name: "compute_financial_health",
    description: "Computes financial health score (0-100) and detailed breakdown of a wallet. Accepts either onchainDataJson or walletAddress.",
    schema: z.object({
      onchainDataJson: z.string().optional().describe("The JSON string output from fetch_onchain_data"),
      walletAddress: z.string().optional().describe("The wallet address to analyze if onchainDataJson is not provided"),
    }),
  }
);
