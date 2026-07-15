import type { WalletData } from "@/types/walletData";
import { getTierPriceUsdt } from "@/lib/agent/x402";

export const SIGNAL_IDS = [
  "monthly-income",
  "financial-health",
  "reputation-score",
  "loan-capacity",
  "statement",
  "assessment"
] as const;

export type SignalId = (typeof SIGNAL_IDS)[number];

export const ANALYZE_FIELD_KEYS = [
  "monthlyIncome",
  "financialHealth",
  "reputationScore",
  "loanCapacity",
  "statement",
  "assessment",
  "walletData"
] as const;

export type AnalyzeFieldKey = (typeof ANALYZE_FIELD_KEYS)[number];

const FIELD_TO_SIGNAL: Record<Exclude<AnalyzeFieldKey, "walletData">, SignalId> = {
  monthlyIncome: "monthly-income",
  financialHealth: "financial-health",
  reputationScore: "reputation-score",
  loanCapacity: "loan-capacity",
  statement: "statement",
  assessment: "assessment"
};

export function isSignalId(value: string): value is SignalId {
  return (SIGNAL_IDS as readonly string[]).includes(value);
}

export function parseAnalyzeFields(
  raw: string | string[] | undefined | null
): AnalyzeFieldKey[] | null {
  if (raw == null || raw === "") return null;

  const parts = (Array.isArray(raw) ? raw : raw.split(","))
    .map((s) => s.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  const invalid = parts.filter((p) => !(ANALYZE_FIELD_KEYS as readonly string[]).includes(p));
  if (invalid.length > 0) {
    throw new Error(
      `Invalid fields: ${invalid.join(", ")}. Allowed: ${ANALYZE_FIELD_KEYS.join(", ")}.`
    );
  }

  return parts as AnalyzeFieldKey[];
}

export function signalMeta() {
  return SIGNAL_IDS.map((id) => ({
    id,
    path: `/api/wallet/{address}/signals/${id}`,
    analyzeField: Object.entries(FIELD_TO_SIGNAL).find(([, signal]) => signal === id)?.[0] ?? null
  }));
}

export function extractSignalData(signal: SignalId, walletData: WalletData) {
  const { metrics } = walletData;

  switch (signal) {
    case "monthly-income":
      return {
        label: metrics.incomeProfile.label,
        monthlyEstimateUsd: metrics.incomeProfile.monthlyEstimateUsd,
        weeklyConsistency: metrics.incomeProfile.weeklyConsistency,
        averageInflowUsd: metrics.incomeProfile.averageInflowUsd,
        recurringSenderPatterns: metrics.incomeProfile.recurringSenderPatterns,
        incomeByPeriod: walletData.incomeByPeriod
      };
    case "financial-health":
      return {
        score: metrics.financialHealth.score,
        breakdown: metrics.financialHealth.breakdown
      };
    case "reputation-score":
      return {
        score: metrics.reputation.score,
        category: metrics.reputation.category,
        rationale: metrics.reputation.rationale,
        riskCategory: metrics.risk.category
      };
    case "loan-capacity":
      return {
        range: metrics.loanCapacity.range,
        minLoanUsd: metrics.loanCapacity.minLoanUsd,
        maxLoanUsd: metrics.loanCapacity.maxLoanUsd,
        confidence: metrics.loanCapacity.confidence,
        factors: metrics.loanCapacity.factors
      };
    case "statement":
      return {
        period: "3M" as const,
        totalInflowUsd: walletData.incomeByPeriod["3M"].inbound,
        totalOutflowUsd: walletData.incomeByPeriod["3M"].outbound,
        netFlowUsd: walletData.incomeByPeriod["3M"].net,
        trendPct: walletData.incomeByPeriod["3M"].trendPct,
        transactionCount: walletData.transactions.length,
        monthly: walletData.cashFlow.monthly
      };
    case "assessment":
      return {
        aiDashboardSummary: walletData.onfraAssessment.narrative,
        strengths: walletData.onfraAssessment.strengths,
        watchItems: walletData.onfraAssessment.watchItems,
        aiAttestation: walletData.attestation.paragraph,
        verificationCode: walletData.verificationCode
      };
    default:
      return {};
  }
}

export type FullAnalysisPayload = ReturnType<typeof buildFullAnalysisPayload>;

export function buildFullAnalysisPayload(
  walletAddress: string,
  walletData: WalletData,
  cached: boolean,
  isOwnWallet: boolean,
  fetchedAt?: string
) {
  const metrics = walletData.metrics;
  const priceUsdt = getTierPriceUsdt("external");

  return {
    status: "completed" as const,
    cached,
    isOwnWallet,
    walletAddress: walletAddress.toLowerCase(),
    walletData,
    ens: walletData.ens,
    monthlyIncome: extractSignalData("monthly-income", walletData),
    financialHealthScore: metrics.financialHealth.score,
    financialHealthBreakdown: metrics.financialHealth.breakdown,
    reputationScore: metrics.reputation.score,
    reputationCategory: metrics.reputation.category,
    riskCategory: metrics.risk.category,
    incomeLabel: metrics.incomeProfile.label,
    loanRange: metrics.loanCapacity.range,
    loanCapacity: extractSignalData("loan-capacity", walletData),
    loanConfidence: metrics.loanCapacity.confidence,
    aiDashboardSummary: walletData.onfraAssessment.narrative,
    aiAttestation: walletData.attestation.paragraph,
    assessment: extractSignalData("assessment", walletData),
    threeMonthStatement: extractSignalData("statement", walletData),
    statement: extractSignalData("statement", walletData),
    x402Billing: { chargedUsdt: priceUsdt, token: "USDT", chain: "celo", free: false },
    createdAt: fetchedAt ?? new Date().toISOString()
  };
}

export function pickAnalysisFields(
  payload: FullAnalysisPayload,
  fields: AnalyzeFieldKey[]
): Record<string, unknown> {
  const base = {
    status: payload.status,
    cached: payload.cached,
    isOwnWallet: payload.isOwnWallet,
    walletAddress: payload.walletAddress,
    ens: payload.ens,
    x402Billing: payload.x402Billing,
    createdAt: payload.createdAt,
    fields
  };

  const picked: Record<string, unknown> = { ...base };

  for (const field of fields) {
    switch (field) {
      case "monthlyIncome":
        picked.monthlyIncome = payload.monthlyIncome;
        picked.incomeLabel = payload.incomeLabel;
        break;
      case "financialHealth":
        picked.financialHealthScore = payload.financialHealthScore;
        picked.financialHealthBreakdown = payload.financialHealthBreakdown;
        break;
      case "reputationScore":
        picked.reputationScore = payload.reputationScore;
        picked.reputationCategory = payload.reputationCategory;
        picked.riskCategory = payload.riskCategory;
        break;
      case "loanCapacity":
        picked.loanRange = payload.loanRange;
        picked.loanConfidence = payload.loanConfidence;
        picked.loanCapacity = payload.loanCapacity;
        break;
      case "statement":
        picked.statement = payload.statement;
        picked.threeMonthStatement = payload.threeMonthStatement;
        break;
      case "assessment":
        picked.assessment = payload.assessment;
        picked.aiDashboardSummary = payload.aiDashboardSummary;
        picked.aiAttestation = payload.aiAttestation;
        break;
      case "walletData":
        picked.walletData = payload.walletData;
        break;
      default:
        break;
    }
  }

  return picked;
}
