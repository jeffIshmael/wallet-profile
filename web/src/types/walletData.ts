import type { IncomeAnimalKey } from "@/data/incomeAnimals";

export type WalletData = {
  walletAddress: string;
  ens: string | null;
  walletAgeMonths: number;
  walletAgeDays: number;
  celoPrice: number;
  totalTransactions: number;
  portfolio: {
    stablecoinBalance: number;
    volatileBalance: number;
    defiExposure: number;
    nftCount: number;
    nftExposure: number;
    totalValueUsd: number;
  };
  tokens: Array<{
    symbol: string;
    name: string;
    balance: number;
    usdValue: number;
    isStable: boolean;
  }>;
  incomeByPeriod: Record<
    "1M" | "3M" | "6M" | "12M",
    { inbound: number; outbound: number; net: number; trendPct: number }
  >;
  statementMonthlyFlow: Record<string, Array<{ month: string; inflow: number; outflow: number }>>;
  tokenFlows: Array<{
    symbol: string;
    name: string;
    inflow: number;
    outflow: number;
    net: number;
    usd: number;
  }>;
  transactions: Array<{
    timestamp: string;
    token: string;
    amount: number;
    amountToken: number;
    direction: "Incoming" | "Outgoing";
    recipient: string;
    hash: string;
  }>;
  growthHistory: Record<string, Array<{ month: string; value: number }>>;
  firstTransaction: { hash: string; timestamp: string; token: string } | null;
  lastTransaction: { hash: string; timestamp: string; token: string } | null;
  metrics: {
    financialHealth: {
      score: number;
      breakdown: {
        incomeStability: number;
        savingsDiscipline: number;
        portfolioRisk: number;
        spendingDiscipline: number;
        walletMaturity: number;
        debtRiskSignals: number;
      };
    };
    reputation: {
      score: number;
      category: string;
      rationale: string;
    };
    risk: {
      category: string;
      allocation: { stablecoin: number; volatile: number; defi: number; nft: number };
    };
    incomeProfile: {
      label: IncomeAnimalKey;
      score: number;
      monthlyEstimateUsd: number;
      weeklyConsistency: number;
      averageInflowUsd: number;
      recurringSenderPatterns: boolean;
      flag: string;
    };
    loanCapacity: {
      range: string;
      minLoanUsd: number;
      maxLoanUsd: number;
      scaleMaxUsd: number;
      confidence: string;
      factors: {
        incomeConsistency: number;
        reputation: number;
        riskProfile: string;
      };
    };
  };
  monthlyIncomeHistory: number[];
  monthlyIncomeStats: { changePct: number; highest: number; lowest: number };
  cashFlow: {
    periodLabel: string;
    inflows: number;
    outflows: number;
    net: number;
    monthly: Array<{ month: string; in: number; out: number }>;
  };
  onfraAssessment: {
    narrative: string;
    strengths: string[];
    watchItems: string[];
  };
  verificationCode: string;
  attestation: {
    hash: string;
    paragraph: string;
  };
};
