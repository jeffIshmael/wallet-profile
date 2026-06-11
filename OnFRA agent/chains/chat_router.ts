export type QueryIntent =
  | "financial_health"
  | "loan_capacity"
  | "income"
  | "reputation"
  | "risk"
  | "general";

export function classifyQuery(message: string): QueryIntent {
  const q = message.toLowerCase();

  if (/\b(reputation|trust|trustworthy)\b/.test(q)) return "reputation";
  if (/\b(income|monthly|inflow|earn|earning)\b/.test(q)) return "income";
  if (/\b(loan|borrow|limit|spending|spend|afford)\b/.test(q)) return "loan_capacity";
  if (/\b(risk|portfolio|allocation|volatile|exposure)\b/.test(q)) return "risk";
  if (/\b(health|score|hurting|low|improve|weak)\b/.test(q)) return "financial_health";

  return "general";
}

export type CachedDashboard = {
  walletAddress: string;
  ens: string | null;
  metrics: {
    financialHealth: {
      score: number;
      breakdown: Record<string, number>;
    };
    reputation: { score: number; category: string; rationale: string };
    risk: { category: string; allocation: Record<string, number> };
    incomeProfile: {
      label: string;
      monthlyEstimateUsd: number;
      weeklyConsistency: number;
      averageInflowUsd: number;
    };
    loanCapacity: { range: string; confidence: string; minLoanUsd: number; maxLoanUsd: number };
  };
  onfraAssessment: {
    narrative: string;
    strengths: string[];
    watchItems: string[];
  };
  portfolio: { stablecoinBalance: number; volatileBalance: number; totalValueUsd: number };
};

function weakestBreakdown(breakdown: Record<string, number>): [string, number] {
  const labels: Record<string, string> = {
    incomeStability: "income stability",
    savingsDiscipline: "savings buffer",
    portfolioRisk: "portfolio risk",
    spendingDiscipline: "spending discipline",
    walletMaturity: "wallet maturity",
    debtRiskSignals: "debt risk signals"
  };

  const sorted = Object.entries(breakdown).sort((a, b) => a[1] - b[1]);
  const [key, value] = sorted[0] ?? ["incomeStability", 0];
  return [labels[key] ?? key, value];
}

function buildLoanTips(
  metrics: CachedDashboard["metrics"],
  onfraAssessment: CachedDashboard["onfraAssessment"]
): string[] {
  const tips: string[] = [];
  const { breakdown } = metrics.financialHealth;

  if (breakdown.incomeStability < 60) {
    tips.push("Build a steady 90-day record of recurring inflows (salary-like payments help most).");
  }
  if (breakdown.savingsDiscipline < 60) {
    tips.push("Keep a larger stablecoin buffer so lenders see you can absorb shocks.");
  }
  if (breakdown.portfolioRisk < 60) {
    tips.push("Reduce concentrated volatile or DeFi exposure — shift toward stablecoins.");
  }
  if (breakdown.spendingDiscipline < 60) {
    tips.push("Smooth out large outflows; avoid frequent big withdrawals relative to income.");
  }
  if (breakdown.walletMaturity < 50) {
    tips.push("Stay active over time — wallet age and consistent usage improve confidence.");
  }

  for (const item of onfraAssessment.watchItems.slice(0, 3)) {
    if (!tips.includes(item)) tips.push(item);
  }

  if (tips.length === 0) {
    tips.push(
      "Maintain steady monthly inflows and a healthy stablecoin balance.",
      "Keep portfolio risk moderate and avoid erratic large outflows."
    );
  }

  return tips.slice(0, 4);
}

export function answerFromCachedDashboard(
  message: string,
  intent: QueryIntent,
  dashboard: CachedDashboard
): string | null {
  const { metrics, onfraAssessment, portfolio } = dashboard;
  const you = "Your";

  switch (intent) {
    case "financial_health": {
      const { score, breakdown } = metrics.financialHealth;
      const [weakestLabel, weakestScore] = weakestBreakdown(breakdown);
      const lines = [
        `${you} financial health score is ${score}/100. The weakest factor is ${weakestLabel} (${weakestScore}/100).`,
        "",
        "Breakdown:",
        `• Income stability: ${breakdown.incomeStability}/100`,
        `• Savings buffer: ${breakdown.savingsDiscipline}/100`,
        `• Portfolio risk: ${breakdown.portfolioRisk}/100`,
        `• Spending discipline: ${breakdown.spendingDiscipline}/100`,
        `• Wallet maturity: ${breakdown.walletMaturity}/100`
      ];
      if (onfraAssessment.watchItems.length > 0) {
        lines.push("", "Areas to improve:");
        for (const item of onfraAssessment.watchItems.slice(0, 3)) {
          lines.push(`• ${item}`);
        }
      }
      return lines.join("\n");
    }
    case "loan_capacity": {
      const { range, confidence, minLoanUsd, maxLoanUsd } = metrics.loanCapacity;
      const wantsTips = /\b(raise|improve|how|increase|boost)\b/i.test(message);
      const lines = [
        `${you} safe borrowing range is ${range} (${confidence} confidence), roughly $${minLoanUsd.toLocaleString()}–$${maxLoanUsd.toLocaleString()}.`
      ];
      if (wantsTips) {
        lines.push("", "To improve your loan limit:");
        const tips = buildLoanTips(metrics, onfraAssessment);
        for (const tip of tips) lines.push(`• ${tip}`);
      }
      return lines.join("\n");
    }
    case "income":
      return `${you} estimated monthly income is about $${metrics.incomeProfile.monthlyEstimateUsd.toLocaleString()}, classified as "${metrics.incomeProfile.label}". Average inflow size is $${metrics.incomeProfile.averageInflowUsd.toLocaleString()} with ${metrics.incomeProfile.weeklyConsistency}% weekly consistency.`;
    case "reputation":
      return `${you} wallet reputation is ${metrics.reputation.score}/100 (${metrics.reputation.category}). ${metrics.reputation.rationale}`;
    case "risk":
      return `${you} portfolio risk is "${metrics.risk.category}". Allocation — stablecoins ${metrics.risk.allocation.stablecoin}%, volatile ${metrics.risk.allocation.volatile}%, DeFi ${metrics.risk.allocation.defi}%, NFTs ${metrics.risk.allocation.nft}%. Total portfolio value ~$${portfolio.totalValueUsd.toFixed(2)}.`;
    case "general":
      if (/\b(hello|hi|help|what can)\b/i.test(message)) {
        return `I can answer questions about your financial health (${metrics.financialHealth.score}/100), reputation (${metrics.reputation.score}/100), income (~$${metrics.incomeProfile.monthlyEstimateUsd}/mo), loan capacity (${metrics.loanCapacity.range}), and portfolio risk (${metrics.risk.category}). What would you like to know?`;
      }
      return null;
  }
}

export const INTENT_TOOL: Record<Exclude<QueryIntent, "general">, string> = {
  financial_health: "compute_financial_health",
  loan_capacity: "loan_capacity_estimator",
  income: "income_stability_analysis",
  reputation: "compute_reputation_score",
  risk: "risk_exposure_breakdown"
};
