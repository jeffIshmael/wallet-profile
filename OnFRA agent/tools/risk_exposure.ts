import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { OnchainData } from "./fetch_onchain_data.js";
import { cachePortfolioSnapshot } from "../lib/getWalletDetails.js";

export interface RiskExposureResult {
  riskCategory: "Low" | "Medium" | "High";
  breakdown: {
    stablecoinPct: number;
    volatileAssetPct: number;
    defiExposurePct: number;
    nftExposurePct: number;
  };
}

function allocateFungiblePercentages(
  stablecoinBalance: number,
  volatileBalance: number,
  defiExposure: number
) {
  const fungibleTotal = stablecoinBalance + volatileBalance + defiExposure;
  if (fungibleTotal <= 0) {
    return { stablecoinPct: 0, volatileAssetPct: 0, defiExposurePct: 0, fungibleTotal: 0 };
  }

  let stablecoinPct = Math.round((stablecoinBalance / fungibleTotal) * 100);
  let volatileAssetPct = Math.round((volatileBalance / fungibleTotal) * 100);
  let defiExposurePct = Math.round((defiExposure / fungibleTotal) * 100);

  const drift = 100 - (stablecoinPct + volatileAssetPct + defiExposurePct);
  if (drift !== 0) {
    if (stablecoinBalance >= volatileBalance && stablecoinBalance >= defiExposure) {
      stablecoinPct += drift;
    } else if (volatileBalance >= defiExposure) {
      volatileAssetPct += drift;
    } else {
      defiExposurePct += drift;
    }
  }

  return { stablecoinPct, volatileAssetPct, defiExposurePct, fungibleTotal };
}

export const riskExposure = tool(
  async ({ onchainDataJson, walletAddress }) => {
    let data: Pick<OnchainData, "stablecoinBalance" | "volatileBalance" | "defiExposure" | "nftCount">;

    if (onchainDataJson) {
      const parsed = JSON.parse(onchainDataJson) as OnchainData;
      data = parsed;
    } else if (walletAddress) {
      console.log("Fetching portfolio snapshot for risk analysis:", walletAddress.toLowerCase());
      const snapshot = await cachePortfolioSnapshot(walletAddress);
      data = snapshot;
    } else {
      throw new Error("Either onchainDataJson or walletAddress must be provided.");
    }

    const { stablecoinBalance, volatileBalance, defiExposure, nftCount = 0 } = data;
    const { stablecoinPct, volatileAssetPct, defiExposurePct, fungibleTotal } = allocateFungiblePercentages(
      stablecoinBalance,
      volatileBalance,
      defiExposure
    );

    let nftExposurePct = 0;
    if (fungibleTotal <= 0 && nftCount > 0) {
      nftExposurePct = 100;
    }

    let riskCategory: "Low" | "Medium" | "High" = "Medium";
    if (fungibleTotal > 0 && stablecoinPct >= 70) {
      riskCategory = "Low";
    } else if (volatileAssetPct > 60 || defiExposurePct > 40) {
      riskCategory = "High";
    } else if (fungibleTotal <= 0 && nftCount > 0) {
      riskCategory = "High";
    } else if (nftCount >= 5 && stablecoinPct < 50) {
      riskCategory = "High";
    } else if (nftCount > 0) {
      riskCategory = "Medium";
    }

    const result: RiskExposureResult = {
      riskCategory,
      breakdown: {
        stablecoinPct,
        volatileAssetPct,
        defiExposurePct,
        nftExposurePct
      }
    };

    return JSON.stringify(result, null, 2);
  },
  {
    name: "risk_exposure_breakdown",
    description:
      "Analyses wallet balance distribution and determines portfolio risk exposure percentages and category (Low/Medium/High). Accepts either onchainDataJson or walletAddress.",
    schema: z.object({
      onchainDataJson: z.string().optional().describe("The JSON string output from fetch_onchain_data"),
      walletAddress: z.string().optional().describe("The wallet address to analyze if onchainDataJson is not provided")
    })
  }
);
