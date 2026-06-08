import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchOnchainData } from "./fetch_onchain_data.js";
import { incomeStability } from "./income_stability.js";
import { riskExposure } from "./risk_exposure.js";

export interface LoanCapacityResult {
  safeLoanRange: string;
  minLoanUsd: number;
  maxLoanUsd: number;
  confidence: "Low" | "Medium" | "High";
}

export const loanCapacity = tool(
  async ({ incomeStabilityJson, riskExposureJson, onchainDataJson, walletAddress }) => {
    let incomeData: any;
    let riskData: any;
    let rawData: any;

    // Resolve rawData first if needed
    if (onchainDataJson) {
      rawData = JSON.parse(onchainDataJson);
    } else if (walletAddress) {
      const fetched = await fetchOnchainData.invoke({ walletAddress });
      rawData = JSON.parse(fetched);
    }

    // Resolve incomeData
    if (incomeStabilityJson) {
      incomeData = JSON.parse(incomeStabilityJson);
    } else {
      const input = rawData ? { onchainDataJson: JSON.stringify(rawData) } : { walletAddress };
      const res = await incomeStability.invoke(input);
      incomeData = JSON.parse(res);
    }

    // Resolve riskData
    if (riskExposureJson) {
      riskData = JSON.parse(riskExposureJson);
    } else {
      const input = rawData ? { onchainDataJson: JSON.stringify(rawData) } : { walletAddress };
      const res = await riskExposure.invoke(input);
      riskData = JSON.parse(res);
    }

    const monthlyInflow = incomeData.monthlyIncomeEstimateUsd || 0;
    const consistency = incomeData.weeklyInflowConsistency || 0;
    const riskCategory = riskData.riskCategory || "Medium";
    
    const stableBalance = rawData ? (rawData.stablecoinBalance || 0) : 0;
    const walletAge = rawData ? (rawData.walletAgeMonths || 0) : 12;

    // Capacity calculation
    // Base is 30% of monthly income
    let baseCapacity = monthlyInflow * 0.3;

    // Consistency multiplier
    const consistencyMult = consistency / 100; // 0 to 1
    baseCapacity *= (0.5 + 0.5 * consistencyMult); // from 0.5x to 1.0x

    // Risk multiplier
    let riskMult = 0.8;
    if (riskCategory === "Low") riskMult = 1.2;
    if (riskCategory === "High") riskMult = 0.4;
    baseCapacity *= riskMult;

    // Balance booster: add 10% of stablecoin balances
    baseCapacity += stableBalance * 0.1;

    // Rounding and bounds
    const capacity = Math.max(0, Math.round(baseCapacity));
    const minLoanUsd = Math.round(capacity * 0.7);
    const maxLoanUsd = Math.round(capacity * 1.3);

    let safeLoanRange = "0 USD (Ineligible)";
    if (maxLoanUsd > 0) {
      safeLoanRange = `${minLoanUsd}-${maxLoanUsd} USD`;
    }

    // Confidence mapping
    let confidence: "Low" | "Medium" | "High" = "Medium";
    if (walletAge > 24 && consistency > 80) {
      confidence = "High";
    } else if (walletAge < 6 || consistency < 40) {
      confidence = "Low";
    }

    const result: LoanCapacityResult = {
      safeLoanRange,
      minLoanUsd,
      maxLoanUsd,
      confidence,
    };

    return JSON.stringify(result, null, 2);
  },
  {
    name: "loan_capacity_estimator",
    description: "Estimates safe loan capacity and range in USD based on wallet income stability and risk exposure. Accepts incomeStabilityJson, riskExposureJson, onchainDataJson, or walletAddress.",
    schema: z.object({
      incomeStabilityJson: z.string().optional().describe("JSON string output from income_stability_analysis"),
      riskExposureJson: z.string().optional().describe("JSON string output from risk_exposure_breakdown"),
      onchainDataJson: z.string().optional().describe("JSON string output from fetch_onchain_data"),
      walletAddress: z.string().optional().describe("The wallet address to estimate if JSONs are not provided"),
    }),
  }
);
