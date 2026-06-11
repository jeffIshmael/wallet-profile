import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { incomeStability } from "./income_stability.js";
import { riskExposure } from "./risk_exposure.js";
import { cachePortfolioSnapshot, getWalletAgeMonths } from "../lib/getWalletDetails.js";

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
    let stableBalance = 0;
    let walletAge = 12;

    if (incomeStabilityJson) {
      incomeData = JSON.parse(incomeStabilityJson);
    } else {
      const input = onchainDataJson
        ? { onchainDataJson }
        : { walletAddress };
      const res = await incomeStability.invoke(input);
      incomeData = JSON.parse(res);
    }

    if (riskExposureJson) {
      riskData = JSON.parse(riskExposureJson);
    } else {
      const input = onchainDataJson
        ? { onchainDataJson }
        : { walletAddress };
      const res = await riskExposure.invoke(input);
      riskData = JSON.parse(res);
    }

    if (onchainDataJson) {
      const rawData = JSON.parse(onchainDataJson);
      stableBalance = rawData.stablecoinBalance || 0;
      walletAge = rawData.walletAgeMonths || 12;
    } else if (walletAddress) {
      console.log("Fetching loan capacity inputs for wallet:", walletAddress.toLowerCase());
      const [snapshot, ageMonths] = await Promise.all([
        cachePortfolioSnapshot(walletAddress),
        getWalletAgeMonths(walletAddress)
      ]);
      stableBalance = snapshot.stablecoinBalance;
      walletAge = ageMonths;
    }

    const monthlyInflow = incomeData.monthlyIncomeEstimateUsd || 0;
    const consistency = incomeData.weeklyInflowConsistency || 0;
    const riskCategory = riskData.riskCategory || "Medium";

    let baseCapacity = monthlyInflow * 0.3;

    const consistencyMult = consistency / 100;
    baseCapacity *= 0.5 + 0.5 * consistencyMult;

    let riskMult = 0.8;
    if (riskCategory === "Low") riskMult = 1.2;
    if (riskCategory === "High") riskMult = 0.4;
    baseCapacity *= riskMult;

    baseCapacity += stableBalance * 0.1;

    const capacity = Math.max(0, Math.round(baseCapacity));
    let minLoanUsd = 0;
    let maxLoanUsd = 0;

    if (capacity >= 100) {
      minLoanUsd = Math.round(capacity * 0.7);
      maxLoanUsd = Math.round(capacity * 1.3);
    } else if (capacity > 0) {
      minLoanUsd = capacity;
      maxLoanUsd = capacity;
    }

    let safeLoanRange = "0 USD (Ineligible)";
    if (maxLoanUsd > 0) {
      const spread = maxLoanUsd - minLoanUsd;
      const threshold = Math.max(50, maxLoanUsd * 0.05);
      safeLoanRange =
        spread <= threshold
          ? `~$${capacity.toLocaleString()} USD`
          : `$${minLoanUsd.toLocaleString()} – $${maxLoanUsd.toLocaleString()} USD`;
    }

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
