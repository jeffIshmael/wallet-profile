import { fetchOnchainData, fetchWalletTransactions } from "../tools/fetch_onchain_data.js";
import { computeFinancialHealth } from "../tools/compute_financial_health.js";
import { computeReputationScore } from "../tools/compute_reputation_score.js";
import { riskExposure } from "../tools/risk_exposure.js";
import { incomeStability } from "../tools/income_stability.js";
import { loanCapacity } from "../tools/loan_capacity.js";
import { SUMMARY_PROMPT } from "../prompts/summary_prompt.js";
import { walletCache } from "../memory/wallet_cache.js";
import { ChatGoogle } from "@langchain/google";
import { computePeriodFlow, fullOnchainDataCache } from "../lib/getWalletDetails.js";

export interface DashboardOutput {
  walletAddress: string;
  ens: string | null;
  financialHealthScore: number;
  financialHealthBreakdown: any;
  reputationScore: number;
  reputationCategory: string;
  reputationRationale: string;
  riskCategory: string;
  riskBreakdown: any;
  incomeLabel: string;
  incomeMetrics: any;
  loanRange: string;
  loanConfidence: string;
  aiDashboardSummary: string;
  aiAttestation: string;
  threeMonthStatement?: {
    totalInflowUsd: number;
    totalOutflowUsd: number;
    netFlowUsd: number;
    transactionCount: number;
  };
  rawJson?: string;
  healthJson?: string;
  reputationJson?: string;
  riskJson?: string;
  incomeJson?: string;
  loanJson?: string;
}

export async function runAnalysisChain(
  walletAddress: string,
  blockHeight?: number,
  options?: { force?: boolean }
): Promise<DashboardOutput> {
  const address = walletAddress.toLowerCase();
  const force = options?.force ?? false;

  if (force) {
    walletCache.invalidate(address);
  }

  // 1. Check Cache
  const cached = force ? null : walletCache.get(address, blockHeight);
  if (cached) {
    console.log(`[AnalysisChain] Cache HIT for wallet: ${address}`);
    return JSON.parse(cached);
  }

  console.log(`[AnalysisChain] Cache MISS. Running sequential analysis tools for wallet: ${address}...`);

  // 2. Use warmed cache when available; otherwise fetch onchain overview + 3M statement
  let rawData: {
    walletAddress: string;
    ens: string | null;
    walletAgeMonths?: number;
    firstTransaction?: unknown;
    lastTransaction?: unknown;
    stablecoinBalance?: number;
    volatileBalance?: number;
    defiExposure?: number;
    nftExposure?: number;
    protocols?: string[];
    transactions?: unknown[];
    threeMonthStatement?: DashboardOutput["threeMonthStatement"];
    [key: string]: unknown;
  };
  const warmed = fullOnchainDataCache.get(address);
  if (warmed?.walletAgeMonths !== undefined && warmed?.transactions) {
    console.log(`[AnalysisChain] Using warmed onchain cache for wallet: ${address}`);
    const statement = computePeriodFlow(warmed.transactions, 3);
    rawData = {
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
      protocols: warmed.protocols ?? [],
      transactions: warmed.transactions,
      threeMonthStatement: {
        totalInflowUsd: statement.inbound,
        totalOutflowUsd: statement.outbound,
        netFlowUsd: statement.net,
        transactionCount: statement.transactionCount
      }
    };
  } else {
    const rawDataJson = await fetchOnchainData.invoke({ walletAddress });
    rawData = JSON.parse(rawDataJson);

    const statementJson = await fetchWalletTransactions.invoke({ walletAddress, months: 3 });
    const statementData = JSON.parse(statementJson);
    const cachedTransactions = fullOnchainDataCache.get(address)?.transactions || [];
    rawData.transactions = cachedTransactions;
    rawData.threeMonthStatement = {
      totalInflowUsd: statementData.threeMonthInflowUsd,
      totalOutflowUsd: statementData.threeMonthOutflowUsd,
      netFlowUsd: statementData.threeMonthNetFlowUsd,
      transactionCount: statementData.transactionCount
    };
  }

  const rawDataJson = JSON.stringify(rawData);
  const combinedDataJson = rawDataJson;

  // 4. Compute independent scores in parallel, then loan capacity
  const [healthJson, reputationJson, riskJson, incomeJson] = await Promise.all([
    computeFinancialHealth.invoke({ onchainDataJson: combinedDataJson }),
    computeReputationScore.invoke({ onchainDataJson: combinedDataJson }),
    riskExposure.invoke({ onchainDataJson: combinedDataJson }),
    incomeStability.invoke({ onchainDataJson: combinedDataJson })
  ]);
  const healthData = JSON.parse(healthJson);
  const reputationData = JSON.parse(reputationJson);
  const riskData = JSON.parse(riskJson);
  const incomeData = JSON.parse(incomeJson);

  const loanJson = await loanCapacity.invoke({
    incomeStabilityJson: incomeJson,
    riskExposureJson: riskJson,
    onchainDataJson: combinedDataJson,
  });
  const loanData = JSON.parse(loanJson);

  // 4. Generate AI Summary using Gemini if key is provided, else fallback to mock AI summary
  let aiDashboardSummary = "";
  let aiAttestation = "";

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      console.log(`[AnalysisChain] Generating AI summary using ChatGoogle...`);
      const model = new ChatGoogle({
        model: "gemini-2.5-flash",
        apiKey: apiKey,
        temperature: 0.2,
      });

      // Format prompt
      const formattedPrompt = await SUMMARY_PROMPT.format({
        financial_health_score: healthData.financialHealthScore,
        reputation_score: reputationData.reputationScore,
        risk_category: riskData.riskCategory,
        income_label: incomeData.incomeLabel,
        monthly_inflow: incomeData.monthlyIncomeEstimateUsd,
        loan_range: loanData.safeLoanRange,
        sub_scores: JSON.stringify(healthData.breakdown),
      });

      const response = await model.invoke(formattedPrompt);
      const text = String((response as { content?: unknown }).content ?? "");

      // Split the text into Dashboard Summary and Attestation
      // Let's check for standard patterns in LLM response
      const sections = text.split(/(?:2\.\s*A\s*formal|Attestation|Attestation Paragraph:)/gi);
      aiDashboardSummary = sections[0].replace(/1\.\s*/gi, "").trim();
      aiAttestation = (sections[1] || "").trim();
      
      if (!aiAttestation) {
        // Fallback split if standard numbering didn't match cleanly
        aiDashboardSummary = text;
        aiAttestation = `Wallet Analyst AI attests that wallet ${address} has a financial health score of ${healthData.financialHealthScore}% and reputation standing of ${reputationData.reputationScore}/100. Portfolio risk is classified as ${riskData.riskCategory} with stable monthly inflows estimated at $${incomeData.monthlyIncomeEstimateUsd} USD.`;
      }
    } catch (err) {
      console.warn("[AnalysisChain] Google Generative AI error, falling back to rule-based AI generator:", err);
    }
  }

  // Fallback Rule-based generator (always runs if no API key or if API call fails)
  if (!aiDashboardSummary || !aiAttestation) {
    console.log(`[AnalysisChain] Generating rule-based AI summary...`);
    
    // Construct realistic observations
    const health = healthData.financialHealthScore;
    const rep = reputationData.reputationScore;
    const label = incomeData.incomeLabel;
    const inflow = incomeData.monthlyIncomeEstimateUsd;

    let healthDesc = "moderate financial discipline";
    if (health >= 85) healthDesc = "exceptional financial discipline and high liquidity retention";
    else if (health < 50) healthDesc = "high capital turnover with low wallet balance retention";

    let riskDesc = "low speculative exposure";
    if (riskData.riskCategory === "High") riskDesc = "significant exposure to volatile assets and active trading behavior";
    else if (riskData.riskCategory === "Medium") riskDesc = "balanced DeFi allocations with moderate volatility exposure";

    aiDashboardSummary = `Your wallet demonstrates ${healthDesc} with an overall health score of ${health}% and reputation of ${rep}/100. Classified as a "${label}", you maintain steady stablecoin inflows with ${riskDesc}. We estimate your safe borrowing limit up to ${loanData.safeLoanRange}.`;
    
    aiAttestation = `This document serves as an official financial attestation generated by Wallet Analyst AI. Wallet address ${address} shows a weighted Financial Health Index of ${health}% and a Trust Reputation Score of ${rep}/100. Over the analyzed history, the wallet demonstrates recurring ${label} dynamics with average monthly inflows of $${inflow} USD and ${riskDesc}. The estimated borrowing capacity is certified within the range of ${loanData.safeLoanRange}.`;
  }

  // 5. Compile final object
  const output: DashboardOutput = {
    walletAddress,
    ens: rawData.ens,
    financialHealthScore: healthData.financialHealthScore,
    financialHealthBreakdown: healthData.breakdown,
    reputationScore: reputationData.reputationScore,
    reputationCategory: reputationData.trustCategory,
    reputationRationale: reputationData.rationale,
    riskCategory: riskData.riskCategory,
    riskBreakdown: riskData.breakdown,
    incomeLabel: incomeData.incomeLabel,
    incomeMetrics: {
      weeklyInflowConsistency: incomeData.weeklyInflowConsistency,
      monthlyIncomeEstimateUsd: incomeData.monthlyIncomeEstimateUsd,
      averageInflowSizeUsd: incomeData.averageInflowSizeUsd,
      recurringSenderPatterns: incomeData.recurringSenderPatterns,
    },
    loanRange: loanData.safeLoanRange,
    loanConfidence: loanData.confidence,
    aiDashboardSummary,
    aiAttestation,
    threeMonthStatement: rawData.threeMonthStatement,
    rawJson: combinedDataJson,
    healthJson,
    reputationJson,
    riskJson,
    incomeJson,
    loanJson,
  };

  // 6. Cache it
  walletCache.set(address, JSON.stringify(output), blockHeight);

  return output;
}
