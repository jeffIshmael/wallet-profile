import type { WalletData } from "@/types/walletData";

export type LenderRecommendation = "approve" | "review" | "decline";

export type LenderScreenResult = {
  status: "completed";
  walletAddress: string;
  screenedAt: string;
  recommendation: LenderRecommendation;
  recommendationRationale: string;
  scores: {
    financialHealth: number;
    reputation: number;
    reputationCategory: string;
  };
  income: {
    label: string;
    monthlyEstimateUsd: number;
    weeklyConsistencyPct: number;
    recurringIncome: boolean;
    threeMonthInflowUsd: number;
    threeMonthOutflowUsd: number;
    threeMonthNetFlowUsd: number;
  };
  lending: {
    recommendedMinUsd: number;
    recommendedMaxUsd: number;
    confidence: string;
    riskCategory: string;
    stablecoinBalanceUsd: number;
    walletAgeMonths: number;
  };
  signals: {
    positive: string[];
    concerns: string[];
  };
  whatLendersAlreadySee: {
    collateralUsd: number;
    stablecoinPct: number;
    volatilePct: number;
    defiExposurePct: number;
    transactionCount: number;
  };
  whatOnfraAdds: {
    onchainIncomeProof: boolean;
    incomeStabilityScore: number;
    spendingDisciplineScore: number;
    loanCapacityEstimateUsd: number;
  };
  verification: {
    hasOnchainPassport: boolean;
    reportId: string | null;
    verifyUrl: string | null;
    onchainReporterContract: string;
  };
};

type BuildLenderScreenOptions = {
  appBaseUrl: string;
  onchainReporterContract: string;
  latestReportId?: string | null;
};

function pushUnique(list: string[], message: string) {
  if (!list.includes(message)) list.push(message);
}

export function buildLenderRecommendation(walletData: WalletData): {
  recommendation: LenderRecommendation;
  rationale: string;
  positive: string[];
  concerns: string[];
} {
  const metrics = walletData.metrics;
  const health = metrics.financialHealth.score;
  const reputation = metrics.reputation.score;
  const income = metrics.incomeProfile;
  const loan = metrics.loanCapacity;
  const risk = metrics.risk.category;
  const threeMonth = walletData.incomeByPeriod["3M"];

  const positive: string[] = [];
  const concerns: string[] = [];

  if (income.label === "Stable Earner" || income.label === "Growing Wallet") {
    pushUnique(positive, "Consistent onchain income pattern detected");
  }
  if (income.recurringSenderPatterns) {
    pushUnique(positive, "Recurring payment senders — payroll or retainer-like inflows");
  }
  if (income.weeklyConsistency >= 75) {
    pushUnique(positive, `High weekly inflow consistency (${income.weeklyConsistency}%)`);
  }
  if (risk === "Low") {
    pushUnique(positive, "Portfolio skews toward stablecoins — lower volatility risk");
  }
  if (walletData.walletAgeMonths >= 12) {
    pushUnique(positive, `Established wallet (${walletData.walletAgeMonths} months onchain)`);
  }
  if (threeMonth.net > 0) {
    pushUnique(positive, `Positive 3-month net cash flow ($${Math.round(threeMonth.net).toLocaleString()})`);
  }
  if (reputation >= 70) {
    pushUnique(positive, `Strong wallet reputation (${reputation}/100)`);
  }

  if (income.label === "Dormant Wallet") {
    pushUnique(concerns, "Dormant wallet — insufficient income activity");
  }
  if (income.label === "Volatile Income") {
    pushUnique(concerns, "Irregular income — high variance in inflow timing or size");
  }
  if (risk === "High") {
    pushUnique(concerns, "High portfolio risk — volatile or NFT-heavy allocation");
  }
  if (loan.confidence === "Low") {
    pushUnique(concerns, "Low confidence in loan capacity estimate — limited history");
  }
  if (walletData.walletAgeMonths < 6) {
    pushUnique(concerns, `Young wallet (${walletData.walletAgeMonths} months) — short track record`);
  }
  if (threeMonth.outbound > threeMonth.inbound && threeMonth.inbound > 0) {
    pushUnique(concerns, "Deficit spending — 3-month outflows exceed inflows");
  }
  if (loan.maxLoanUsd === 0) {
    pushUnique(concerns, "OnFRA estimates zero safe borrowing capacity from onchain data");
  }

  if (
    loan.maxLoanUsd === 0 ||
    health < 35 ||
    reputation < 35 ||
    income.label === "Dormant Wallet"
  ) {
    return {
      recommendation: "decline",
      rationale:
        "Onchain financial signals are too weak for wallet-native underwriting — dormant activity, low scores, or no estimated repayment capacity.",
      positive,
      concerns
    };
  }

  const strongIncome =
    income.label === "Stable Earner" ||
    income.label === "Growing Wallet" ||
    income.label === "Whale Activity";
  const acceptableRisk = risk !== "High";
  const acceptableConfidence = loan.confidence !== "Low";

  if (
    health >= 65 &&
    reputation >= 65 &&
    strongIncome &&
    acceptableRisk &&
    acceptableConfidence &&
    loan.maxLoanUsd > 0
  ) {
    return {
      recommendation: "approve",
      rationale:
        "Wallet shows consistent onchain income, acceptable risk profile, and sufficient history for a wallet-native credit signal. Confirm with collateral and identity checks.",
      positive,
      concerns
    };
  }

  return {
    recommendation: "review",
    rationale:
      "Mixed onchain signals — manual review recommended. OnFRA supplements collateral checks with income stability and cash-flow evidence traditional lenders lack.",
    positive,
    concerns
  };
}

export function buildLenderScreenResult(
  walletData: WalletData,
  options: BuildLenderScreenOptions
): LenderScreenResult {
  const { recommendation, rationale, positive, concerns } = buildLenderRecommendation(walletData);
  const metrics = walletData.metrics;
  const threeMonth = walletData.incomeByPeriod["3M"];
  const allocation = metrics.risk.allocation;
  const reportId = options.latestReportId ?? null;

  return {
    status: "completed",
    walletAddress: walletData.walletAddress.toLowerCase(),
    screenedAt: new Date().toISOString(),
    recommendation,
    recommendationRationale: rationale,
    scores: {
      financialHealth: metrics.financialHealth.score,
      reputation: metrics.reputation.score,
      reputationCategory: metrics.reputation.category
    },
    income: {
      label: metrics.incomeProfile.label,
      monthlyEstimateUsd: metrics.incomeProfile.monthlyEstimateUsd,
      weeklyConsistencyPct: metrics.incomeProfile.weeklyConsistency,
      recurringIncome: metrics.incomeProfile.recurringSenderPatterns,
      threeMonthInflowUsd: threeMonth.inbound,
      threeMonthOutflowUsd: threeMonth.outbound,
      threeMonthNetFlowUsd: threeMonth.net
    },
    lending: {
      recommendedMinUsd: metrics.loanCapacity.minLoanUsd,
      recommendedMaxUsd: metrics.loanCapacity.maxLoanUsd,
      confidence: metrics.loanCapacity.confidence,
      riskCategory: metrics.risk.category,
      stablecoinBalanceUsd: walletData.portfolio.stablecoinBalance,
      walletAgeMonths: walletData.walletAgeMonths
    },
    signals: { positive, concerns },
    whatLendersAlreadySee: {
      collateralUsd: walletData.portfolio.totalValueUsd,
      stablecoinPct: allocation.stablecoin,
      volatilePct: allocation.volatile,
      defiExposurePct: allocation.defi,
      transactionCount: walletData.totalTransactions
    },
    whatOnfraAdds: {
      onchainIncomeProof: threeMonth.inbound > 0,
      incomeStabilityScore: metrics.financialHealth.breakdown.incomeStability,
      spendingDisciplineScore: metrics.financialHealth.breakdown.spendingDiscipline,
      loanCapacityEstimateUsd: metrics.loanCapacity.maxLoanUsd
    },
    verification: {
      hasOnchainPassport: Boolean(reportId),
      reportId,
      verifyUrl: reportId ? `${options.appBaseUrl}/api/agent/verify/${reportId}` : null,
      onchainReporterContract: options.onchainReporterContract
    }
  };
}
