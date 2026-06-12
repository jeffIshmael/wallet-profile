export type QueryIntent =
  | "financial_health"
  | "loan_capacity"
  | "income"
  | "reputation"
  | "risk"
  | "tokens"
  | "general";

export function classifyQuery(message: string): QueryIntent {
  const q = message.toLowerCase();

  if (
    /\b(token|tokens|cusd|celo|usdt|usdc)\b/.test(q) ||
    /\bwhich\b.*\b(receive|spent|spend|send|paid)\b/.test(q) ||
    /\b(receive|received|spend|spent|send|sent)\b.*\b(more|most|mainly)\b/.test(q)
  ) {
    return "tokens";
  }
  if (/\b(reputation|trust|trustworthy)\b/.test(q)) return "reputation";
  if (/\b(income|monthly inflow|earn|earning|salary)\b/.test(q)) return "income";
  if (/\b(loan|borrow|borrowing|limit|capacity|afford)\b/.test(q)) return "loan_capacity";
  if (/\b(spending|spend)\b/.test(q) && /\b(discipline|habit|less|reduce|improve)\b/.test(q)) {
    return "financial_health";
  }
  if (/\b(risk|portfolio|allocation|volatile|exposure|defi)\b/.test(q)) return "risk";
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
  transactions?: Array<{
    token: string;
    amount: number;
    direction: "Incoming" | "Outgoing";
  }>;
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

function formatLoanRangeLine(
  you: string,
  range: string,
  confidence: string,
  minLoanUsd: number,
  maxLoanUsd: number
): string {
  if (minLoanUsd === maxLoanUsd) {
    return `${you} safe borrowing range is about $${minLoanUsd.toLocaleString()} (${confidence} confidence).`;
  }
  return `${you} safe borrowing range is ${range} (${confidence} confidence), roughly $${minLoanUsd.toLocaleString()}–$${maxLoanUsd.toLocaleString()}.`;
}

function summarizeTokenFlows(
  transactions: CachedDashboard["transactions"]
): { topIn?: { token: string; total: number }; topOut?: { token: string; total: number } } | null {
  if (!transactions?.length) return null;

  const inByToken = new Map<string, number>();
  const outByToken = new Map<string, number>();

  for (const tx of transactions) {
    const token = tx.token.toUpperCase();
    const map = tx.direction === "Incoming" ? inByToken : outByToken;
    map.set(token, (map.get(token) ?? 0) + Math.abs(tx.amount));
  }

  const topIn =
    inByToken.size > 0
      ? [...inByToken.entries()].sort((a, b) => b[1] - a[1])[0]
      : undefined;
  const topOut =
    outByToken.size > 0
      ? [...outByToken.entries()].sort((a, b) => b[1] - a[1])[0]
      : undefined;

  return {
    topIn: topIn ? { token: topIn[0], total: topIn[1] } : undefined,
    topOut: topOut ? { token: topOut[0], total: topOut[1] } : undefined
  };
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
      const wantsTips = /\b(raise|improve|how|increase|boost|what do)\b/i.test(message);
      const lines = [formatLoanRangeLine(you, range, confidence, minLoanUsd, maxLoanUsd)];
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
    case "tokens": {
      const summary = summarizeTokenFlows(dashboard.transactions);
      if (!summary?.topIn && !summary?.topOut) {
        return `${you} token flow breakdown isn't available yet. Open the dashboard and refresh your analysis, then ask again.`;
      }

      const lines: string[] = ["Here's how your recent activity breaks down by token:"];
      if (summary.topIn) {
        lines.push(
          `• Most received: ${summary.topIn.token} (~$${summary.topIn.total.toLocaleString()} inbound)`
        );
      }
      if (summary.topOut) {
        lines.push(
          `• Most spent/sent: ${summary.topOut.token} (~$${summary.topOut.total.toLocaleString()} outbound)`
        );
      }
      if (summary.topIn && summary.topOut && summary.topIn.token === summary.topOut.token) {
        lines.push(
          "",
          `${summary.topIn.token} is your main token on both sides — check Transaction Statements for the full ledger.`
        );
      }
      return lines.join("\n");
    }
    case "general":
      if (/\b(who are you|what are you|onfra|wallet analyst)\b/i.test(message)) {
        return [
          "I'm OnFRA — your OnChain Financial Reputation Agent on Wallet Analyst.",
          "",
          "I read your Celo wallet activity and explain:",
          "• Financial health and what's dragging your score",
          "• Reputation and income stability",
          "• Loan capacity and how to improve it",
          "• Token flows and portfolio risk",
          "",
          "Questions about your own wallet are free. Looking up another wallet costs 0.01 USDT."
        ].join("\n");
      }
      if (/\b(hello|hi|help|what can)\b/i.test(message)) {
        return [
          "I can help you understand your onchain financial profile. Try asking:",
          "• Why is my financial health low?",
          "• How do I improve my loan capacity?",
          "• Which token do I receive or spend most?",
          "",
          `Right now: health ${metrics.financialHealth.score}/100, reputation ${metrics.reputation.score}/100, income ~$${metrics.incomeProfile.monthlyEstimateUsd}/mo, loan capacity ${metrics.loanCapacity.range}.`
        ].join("\n");
      }
      return null;
  }
}

export const INTENT_TOOL: Record<Exclude<QueryIntent, "general" | "tokens">, string> = {
  financial_health: "compute_financial_health",
  loan_capacity: "loan_capacity_estimator",
  income: "income_stability_analysis",
  reputation: "compute_reputation_score",
  risk: "risk_exposure_breakdown"
};
