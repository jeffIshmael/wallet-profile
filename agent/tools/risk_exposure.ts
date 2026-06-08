import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { fetchOnchainData, OnchainData } from "./fetch_onchain_data.js";

export interface RiskExposureResult {
  riskCategory: "Low" | "Medium" | "High";
  breakdown: {
    stablecoinPct: number;
    volatileAssetPct: number;
    defiExposurePct: number;
    nftExposurePct: number;
  };
}

export const riskExposure = tool(
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

    const { stablecoinBalance, volatileBalance, defiExposure, nftExposure } = data;

    const totalPortfolio = stablecoinBalance + volatileBalance + defiExposure + nftExposure;

    let stablecoinPct = 0;
    let volatileAssetPct = 0;
    let defiExposurePct = 0;
    let nftExposurePct = 0;

    if (totalPortfolio > 0) {
      stablecoinPct = Math.round((stablecoinBalance / totalPortfolio) * 100);
      volatileAssetPct = Math.round((volatileBalance / totalPortfolio) * 100);
      defiExposurePct = Math.round((defiExposure / totalPortfolio) * 100);
      nftExposurePct = Math.round((nftExposure / totalPortfolio) * 100);
    } else {
      stablecoinPct = 100; // default empty wallet to stable
    }

    // Determine risk category
    let riskCategory: "Low" | "Medium" | "High" = "Medium";
    if (stablecoinPct >= 70) {
      riskCategory = "Low";
    } else if (volatileAssetPct > 60 || nftExposurePct > 30) {
      riskCategory = "High";
    }

    const result: RiskExposureResult = {
      riskCategory,
      breakdown: {
        stablecoinPct,
        volatileAssetPct,
        defiExposurePct,
        nftExposurePct,
      },
    };

    return JSON.stringify(result, null, 2);
  },
  {
    name: "risk_exposure_breakdown",
    description: "Analyses wallet balance distribution and determines portfolio risk exposure percentages and category (Low/Medium/High). Accepts either onchainDataJson or walletAddress.",
    schema: z.object({
      onchainDataJson: z.string().optional().describe("The JSON string output from fetch_onchain_data"),
      walletAddress: z.string().optional().describe("The wallet address to analyze if onchainDataJson is not provided"),
    }),
  }
);
