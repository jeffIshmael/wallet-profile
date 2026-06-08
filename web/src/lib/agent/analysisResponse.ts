import { mockWallet } from "@/data/mockWallet";

/** Maps mock wallet data to WalletAnalysisResult shape for API responses. */
export function buildAnalysisResponse(walletAddress: string) {
  const metrics = mockWallet.metrics;
  const threeMonth = mockWallet.incomeByPeriod["3M"];
  return {
    status: "completed" as const,
    walletAddress: walletAddress.toLowerCase(),
    ens: mockWallet.ens,
    financialHealthScore: metrics.financialHealth.score,
    financialHealthBreakdown: metrics.financialHealth.breakdown,
    reputationScore: metrics.reputation.score,
    reputationCategory: metrics.reputation.category,
    riskCategory: metrics.risk.category,
    incomeLabel: metrics.incomeProfile.label,
    loanRange: metrics.loanCapacity.range,
    loanConfidence: metrics.loanCapacity.confidence,
    aiDashboardSummary: mockWallet.onfraAssessment.narrative,
    aiAttestation: mockWallet.attestation.paragraph,
    threeMonthStatement: {
      totalInflowUsd: threeMonth.inbound,
      totalOutflowUsd: threeMonth.outbound,
      netFlowUsd: threeMonth.net,
      transactionCount: mockWallet.transactions.length
    },
    createdAt: new Date().toISOString()
  };
}
