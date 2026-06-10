"use client";

import { incomeAnimals } from "@/data/incomeAnimals";
import { useWalletData } from "@/hooks/useWalletData";
import { getFinancialHealthLabel, getReputationTag } from "@/lib/format";
import { ScoreCard } from "@/components/scores/ScoreCard";

export function FinancialHealthGauge() {
  const { walletData } = useWalletData();
  if (!walletData) return null;
  const score = walletData.metrics.financialHealth.score;

  return (
    <ScoreCard
      title="Financial Health"
      score={score}
      visual="gauge"
      badge={getFinancialHealthLabel(score)}
      badgeVariant={score >= 71 ? "green" : score >= 41 ? "amber" : "red"}
      description="Composite index of income, savings, risk, and wallet maturity."
      help={{
        meaning:
          "Measures the overall strength of your wallet based on income consistency, savings behavior, cash flow and portfolio composition.",
        calculation:
          "Weighted composite of income stability, savings discipline, portfolio risk, spending discipline, wallet maturity, and debt/risk signals.",
        lenderRelevance: "Higher scores indicate stronger financial stability and lower default risk."
      }}
    />
  );
}

export function IncomeStabilityCard() {
  const { walletData } = useWalletData();
  if (!walletData) return null;
  const income = walletData.metrics.incomeProfile;
  const animal = incomeAnimals[income.label];

  return (
    <ScoreCard
      title="Income Stability"
      score={income.score}
      visual="animal"
      icon={animal.emoji}
      badge={income.label}
      badgeVariant="green"
      description={animal.description}
      help={{
        meaning: "How predictable and consistent your onchain income patterns are over time.",
        calculation:
          "Analyzes recurring inflow frequency, variance between periods, and sender consistency across stablecoin transfers.",
        lenderRelevance: "Stable income signals reliable repayment capacity and lower credit risk."
      }}
    />
  );
}

export function ReputationScoreCard() {
  const { walletData } = useWalletData();
  if (!walletData) return null;
  const { score, rationale } = walletData.metrics.reputation;
  const tag = getReputationTag(score);
  const badgeVariant = score >= 90 ? "green" : score >= 75 ? "blue" : score >= 50 ? "amber" : "red";

  return (
    <ScoreCard
      title="Wallet Reputation"
      score={score}
      visual="ring"
      badge={tag}
      badgeVariant={badgeVariant}
      description={rationale}
      help={{
        meaning: "A trust score reflecting the credibility and reliability of your onchain financial behavior.",
        calculation:
          "Based on wallet age, transaction consistency, protocol interactions, and absence of suspicious activity.",
        lenderRelevance: "Higher reputation reduces perceived fraud risk and supports loan approval."
      }}
    />
  );
}
