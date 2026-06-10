import { runDashboardAnalysis } from "@/lib/agent/onfraServer";
import { assertPayment } from "@/lib/agent/x402";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";

/** Wallet analysis powered by the OnFRA LangChain agent. */
export async function POST(req: Request) {
  const paymentBlock = assertPayment(req, "analysis");
  if (paymentBlock) return paymentBlock;

  const body = parseJsonBody<{ walletAddress?: string; months?: number }>(
    await req.json().catch(() => null)
  );
  if (!body) return badRequest("Invalid JSON body.");

  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  try {
    const walletData = await runDashboardAnalysis(walletAddress);
    const metrics = walletData.metrics;

    return Response.json({
      status: "completed" as const,
      walletAddress: walletAddress.toLowerCase(),
      walletData,
      ens: walletData.ens,
      financialHealthScore: metrics.financialHealth.score,
      financialHealthBreakdown: metrics.financialHealth.breakdown,
      reputationScore: metrics.reputation.score,
      reputationCategory: metrics.reputation.category,
      riskCategory: metrics.risk.category,
      incomeLabel: metrics.incomeProfile.label,
      loanRange: metrics.loanCapacity.range,
      loanConfidence: metrics.loanCapacity.confidence,
      aiDashboardSummary: walletData.onfraAssessment.narrative,
      aiAttestation: walletData.attestation.paragraph,
      threeMonthStatement: {
        totalInflowUsd: walletData.incomeByPeriod["3M"].inbound,
        totalOutflowUsd: walletData.incomeByPeriod["3M"].outbound,
        netFlowUsd: walletData.incomeByPeriod["3M"].net,
        transactionCount: walletData.transactions.length
      },
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("[analyze] OnFRA agent failed:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Analysis failed." },
      { status: 500 }
    );
  }
}
