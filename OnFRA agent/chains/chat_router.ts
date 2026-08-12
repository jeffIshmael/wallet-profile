export type QueryIntent =
  | "financial_health"
  | "loan_capacity"
  | "income"
  | "reputation"
  | "risk"
  | "tokens"
  | "statement"
  | "general";

export function isExplainerQuestion(message: string): boolean {
  const q = message.toLowerCase();
  if (/\bwhat does\b.*\bmean\b/.test(q)) return true;
  if (/\b(explain|define|tell me about)\b/.test(q)) return true;
  if (
    /\bwhat is\b/.test(q) &&
    !/\bwhat is my\b/.test(q) &&
    /\b(financial health|reputation|loan capacity|income stability|risk score|onfra|verified report|financial passport|official report)\b/.test(
      q
    )
  ) {
    return true;
  }
  return false;
}

export function isVerifiedReportExplainer(message: string): boolean {
  const q = message.toLowerCase();
  if (/\b(generate|create|buy|purchase|order|download|get me)\b/.test(q)) return false;
  return /\b(verified report|financial passport|official report|attestation report)\b/.test(q);
}

export function answerVerifiedReportExplainer(isOwnWallet: boolean): string {
  const lines = [
    "A Verified Financial Reputation Report — the Onfra Financial Passport — is a lender-ready PDF that turns onchain wallet activity into proof you can share with lenders, underwriters, or partners.",
    "",
    "Each report includes:",
    "• A 6-month transaction statement",
    "• Financial health, reputation, income stability, and loan capacity scores",
    "• AI assessment and borrowing recommendations",
    "• A unique verification code (REP-XXXXXXXXXX)",
    "",
    "Reports are pinned to IPFS and registered onchain on Celo. Anyone can confirm authenticity at app.onfra.xyz/verify using the code.",
    "",
    "Cost: 0.10 USDT for any wallet — yours or someone else's.",
    "Quick wallet lookups in chat cost 0.01 USDT. Questions about your own wallet are free."
  ];

  if (isOwnWallet) {
    lines.push(
      "",
      "To generate one for your wallet, say \"Generate verified report\" here or use the Financial Passport button on your dashboard."
    );
  } else {
    lines.push(
      "",
      "To generate one, include a wallet address and say \"Generate verified report for 0x…\"."
    );
  }

  return lines.join("\n");
}

export function isSupportedChainsQuestion(message: string): boolean {
  const q = message.toLowerCase();
  return (
    /\bdo you\b.*\b(check|analyze|scan|read|support|cover)\b.*\b(base|celo|network|chain|blockchain)\b/.test(
      q
    ) ||
    /\b(base|polygon|ethereum|arbitrum|optimism|bnb|solana)\b.*\b(network|chain|blockchain)\b/.test(
      q
    ) ||
    /\b(network|chain|blockchain)\b.*\b(base|polygon|ethereum|arbitrum|optimism|bnb)\b/.test(q) ||
    /\b(supported|support)\b.*\b(chain|network|blockchain)\b/.test(q) ||
    /\bwhich\b.*\b(chain|network)\b.*\b(support|analyze|check)\b/.test(q) ||
    /\bonchain activity on\b/.test(q)
  );
}

export function answerSupportedChainsExplainer(): string {
  return [
    "Today Onfra analyzes wallet activity on Celo mainnet only — transactions, balances, income patterns, scores, and verified reports all use Celo onchain data.",
    "",
    "We do not yet analyze Base network activity for financial health, reputation, or loan capacity. Base and additional EVM chains are on the roadmap.",
    "",
    "You can connect any EVM address and we will look up that address on Celo. If the wallet has little or no Celo history yet, scores will reflect a new or inactive profile.",
    "",
    "Questions about your own Celo wallet are free. Looking up another address costs 0.01 USDT."
  ].join("\n");
}

export function classifyQuery(message: string): QueryIntent {
  const q = message.toLowerCase();

  if (isExplainerQuestion(message)) return "general";

  if (
    /\b(token|tokens|cusd|celo|usdt|usdc)\b/.test(q) ||
    /\bwhich\b.*\b(receive|spent|spend|send|paid)\b/.test(q) ||
    /\b(receive|received|spend|spent|send|sent)\b.*\b(more|most|mainly)\b/.test(q)
  ) {
    return "tokens";
  }
  if (/\b(statement|ledger|history pdf|download statement)\b/.test(q)) {
    return "statement";
  }
  if (/\b(reputation|trust|trustworthy)\b/.test(q)) return "reputation";
  if (/\b(income|monthly inflow|earn|earning|salary|recurring|subscription)\b/.test(q)) {
    return "income";
  }
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
      recurringSenderPatterns?: boolean;
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
    case "statement": {
      const addr = dashboard.walletAddress;
      const lines = [
        "I can generate a verified onchain transaction statement for your wallet, pin it to IPFS, and provide a shareable PDF link.",
        "",
        "Select the period you'd like to generate:",
        `• [Generate 3-Month Statement (IPFS)](/api/agent/statement/generate?walletAddress=${addr}&period=3M)`,
        `• [Generate 6-Month Statement (IPFS)](/api/agent/statement/generate?walletAddress=${addr}&period=6M)`,
        `• [Generate 12-Month Statement / 1 Year (IPFS)](/api/agent/statement/generate?walletAddress=${addr}&period=12M)`,
        "",
        "You can also filter, search, and download your statement locally on the Transaction Statements page of your dashboard."
      ];
      return lines.join("\n");
    }
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
    case "income": {
      const { label, monthlyEstimateUsd, averageInflowUsd, weeklyConsistency, recurringSenderPatterns } =
        metrics.incomeProfile;
      const asksRecurring = /\b(recurring|subscription|regular|salary-like)\b/i.test(message);
      if (asksRecurring) {
        const detected = recurringSenderPatterns === true;
        const lines = [
          detected
            ? "Yes — we detect recurring sender patterns in your inflows (similar amounts repeated several times)."
            : "No strong recurring payment patterns yet — inflows look irregular rather than salary-like.",
          "",
          `Income profile: "${label}" with ~$${monthlyEstimateUsd.toLocaleString()}/month estimated.`,
          `Weekly consistency: ${weeklyConsistency}%. Average inflow: $${averageInflowUsd.toLocaleString()}.`
        ];
        if (!detected) {
          lines.push(
            "",
            "Tip: Steady, similar-sized inflows over 90 days (e.g. payroll) improve income stability and loan capacity."
          );
        }
        return lines.join("\n");
      }
      return `${you} estimated monthly income is about $${monthlyEstimateUsd.toLocaleString()}, classified as "${label}". Average inflow size is $${averageInflowUsd.toLocaleString()} with ${weeklyConsistency}% weekly consistency.`;
    }
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
    case "general": {
      if (isSupportedChainsQuestion(message)) {
        return answerSupportedChainsExplainer();
      }

      if (isVerifiedReportExplainer(message)) {
        return answerVerifiedReportExplainer(true);
      }

      const conceptAnswer = answerGeneralConcept(message, dashboard);
      if (conceptAnswer) return conceptAnswer;

      if (/\b(recurring|subscription|regular payment|standing order|payroll)\b/i.test(message)) {
        const detected = metrics.incomeProfile.recurringSenderPatterns === true;
        return [
          detected
            ? "Your transaction history shows recurring sender patterns — repeated inflows of similar size."
            : "I don't see clear recurring payment patterns in your history. Inflows look variable rather than payroll-like.",
          "",
          `Profile: "${metrics.incomeProfile.label}", ~$${metrics.incomeProfile.monthlyEstimateUsd.toLocaleString()}/month, ${metrics.incomeProfile.weeklyConsistency}% weekly consistency.`,
          detected
            ? "This helps your income stability score."
            : "Building 90 days of steady, similar inflows would strengthen your financial health."
        ].join("\n");
      }

      if (/\b(who are you|what are you|onfra|onfra|wallet analyst)\b/i.test(message)) {
        return [
          "I'm OnFRA — your OnChain Financial Reputation Agent on Onfra.",
          "",
          "I read your Celo wallet activity and explain:",
          "• Financial health and what's dragging your score",
          "• Reputation and income stability",
          "• Loan capacity and how to improve it",
          "• Token flows and portfolio risk",
          "",
          "Supported today: Celo mainnet only. Base and other chains are coming soon.",
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
}

function answerGeneralConcept(message: string, dashboard: CachedDashboard): string | null {
  if (!isExplainerQuestion(message)) return null;

  const { metrics } = dashboard;
  const q = message.toLowerCase();

  if (/\bfinancial health\b/.test(q)) {
    const { score, breakdown } = metrics.financialHealth;
    const [weakestLabel, weakestScore] = weakestBreakdown(breakdown);
    return [
      "Financial health is OnFRA's 0–100 view of how strong your onchain profile looks to lenders.",
      "",
      "It blends six signals: income stability, savings buffer, portfolio risk, spending discipline, wallet maturity, and debt risk.",
      "",
      `Your score: ${score}/100. Weakest area: ${weakestLabel} (${weakestScore}/100).`,
      "Ask \"How do I improve my financial health?\" for targeted steps."
    ].join("\n");
  }

  if (/\b(reputation|trust)\b/.test(q)) {
    return [
      "Reputation reflects how trustworthy and established your wallet appears onchain — based on activity history, ENS, and behavioral signals.",
      "",
      `Yours: ${metrics.reputation.score}/100 (${metrics.reputation.category}). ${metrics.reputation.rationale}`
    ].join("\n");
  }

  if (/\b(loan capacity|borrowing)\b/.test(q)) {
    const { range, confidence } = metrics.loanCapacity;
    return [
      "Loan capacity is an estimated safe borrowing range derived from your income stability, reputation, and portfolio risk — not a loan offer.",
      "",
      `Your estimate: ${range} (${confidence} confidence).`
    ].join("\n");
  }

  if (/\b(income stability|income)\b/.test(q)) {
    const p = metrics.incomeProfile;
    return [
      "Income stability measures how regular and predictable your inflows are — lenders prefer salary-like patterns over sporadic transfers.",
      "",
      `Yours: "${p.label}", ~$${p.monthlyEstimateUsd.toLocaleString()}/month, ${p.weeklyConsistency}% weekly consistency.`,
      p.recurringSenderPatterns
        ? "Recurring sender patterns detected."
        : "No strong recurring patterns detected yet."
    ].join("\n");
  }

  if (/\b(verified report|financial passport|official report|attestation report)\b/.test(q)) {
    return answerVerifiedReportExplainer(true);
  }

  return null;
}

export function buildDashboardContextForOpenAI(dashboard: CachedDashboard): string {
  const { metrics, onfraAssessment, portfolio } = dashboard;
  const b = metrics.financialHealth.breakdown;
  return [
    `Wallet: ${dashboard.ens ?? dashboard.walletAddress}`,
    `Financial health: ${metrics.financialHealth.score}/100 (income ${b.incomeStability}, savings ${b.savingsDiscipline}, risk ${b.portfolioRisk}, spending ${b.spendingDiscipline}, maturity ${b.walletMaturity})`,
    `Reputation: ${metrics.reputation.score}/100 (${metrics.reputation.category})`,
    `Income: "${metrics.incomeProfile.label}", ~$${metrics.incomeProfile.monthlyEstimateUsd}/mo, ${metrics.incomeProfile.weeklyConsistency}% weekly consistency, recurring patterns: ${metrics.incomeProfile.recurringSenderPatterns ? "yes" : "no"}`,
    `Loan capacity: ${metrics.loanCapacity.range} (${metrics.loanCapacity.confidence})`,
    `Risk: ${metrics.risk.category} — stable ${metrics.risk.allocation.stablecoin}%, volatile ${metrics.risk.allocation.volatile}%, DeFi ${metrics.risk.allocation.defi}%`,
    `Portfolio: ~$${portfolio.totalValueUsd.toFixed(2)} (stable $${portfolio.stablecoinBalance.toFixed(2)}, volatile $${portfolio.volatileBalance.toFixed(2)})`,
    onfraAssessment.strengths.length ? `Strengths: ${onfraAssessment.strengths.join("; ")}` : "",
    onfraAssessment.watchItems.length ? `Watch items: ${onfraAssessment.watchItems.join("; ")}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export const INTENT_TOOL: Record<Exclude<QueryIntent, "general" | "tokens" | "statement">, string> = {
  financial_health: "compute_financial_health",
  loan_capacity: "loan_capacity_estimator",
  income: "income_stability_analysis",
  reputation: "compute_reputation_score",
  risk: "risk_exposure_breakdown"
};
