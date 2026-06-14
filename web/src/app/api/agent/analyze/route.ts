import { runDashboardAnalysis } from "@/lib/agent/onfraServer";
import { insufficientBalanceError } from "@/lib/agent/apiErrors";
import { assertPayment, getTierPriceUsdt } from "@/lib/agent/x402";
import { assertSufficientUsdtBalance } from "@/lib/agent/usdtBalance";
import { resolveAnalysisTarget } from "@/lib/agent/walletQuery";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import {
  getCachedWalletData,
  saveAnalysisRun
} from "@/lib/db/analysis";
import { trackApiEvent } from "@/lib/db/events";
import type { WalletData } from "@/types/walletData";

function analysisResponse(walletAddress: string, walletData: WalletData, cached: boolean, isOwnWallet: boolean) {
  const metrics = walletData.metrics;
  const priceUsdt = getTierPriceUsdt("external");

  return Response.json({
    status: "completed" as const,
    cached,
    isOwnWallet,
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
    x402Billing: isOwnWallet
      ? { chargedUsdt: "0", token: "USDT", chain: "celo", free: true }
      : { chargedUsdt: priceUsdt, token: "USDT", chain: "celo", free: false },
    createdAt: new Date().toISOString()
  });
}

/** Wallet analysis powered by the OnFRA LangChain agent. */
export async function POST(req: Request) {
  const body = parseJsonBody<{
    walletAddress?: string;
    callerAddress?: string;
    months?: number;
    force?: boolean;
  }>(await req.json().catch(() => null));
  if (!body) return badRequest("Invalid JSON body.");

  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  if (body.callerAddress?.trim() && !isEvmAddress(body.callerAddress.trim())) {
    return badRequest("callerAddress must be a valid 0x-prefixed EVM address.");
  }

  const target = resolveAnalysisTarget(walletAddress, body.callerAddress?.trim());
  const priceUsdt = getTierPriceUsdt("external");

  if (target.isExternal) {
    try {
      const balanceCheck = await assertSufficientUsdtBalance(target.callerWallet, priceUsdt);
      if (!balanceCheck.ok) {
        return insufficientBalanceError(balanceCheck.balance, priceUsdt);
      }
    } catch (error) {
      console.warn("[analyze] USDT balance pre-check failed:", error);
    }
  }

  const paymentBlock = await assertPayment(req, "external", {
    skipPayment: target.isOwnWallet,
    skipReason: "own-wallet analyze"
  });
  if (paymentBlock) return paymentBlock;

  const logPrefix = `[analyze ${walletAddress.slice(0, 10)}…]`;
  const started = Date.now();
  console.log(
    `${logPrefix} Starting (ownWallet=${target.isOwnWallet}, force=${Boolean(body.force)}, external=${target.isExternal})`
  );

  try {
    if (!body.force) {
      const cached = await getCachedWalletData(walletAddress);
      if (cached) {
        console.log(`${logPrefix} Cache hit in ${Date.now() - started}ms`);
        await trackApiEvent({
          endpoint: "analyze",
          status: "success",
          walletAddress,
          durationMs: Date.now() - started,
          metadata: { cached: true, isExternal: target.isExternal }
        });
        return analysisResponse(walletAddress, cached, true, target.isOwnWallet);
      }
    }

    const walletData = await runDashboardAnalysis(walletAddress, { force: body.force });
    await saveAnalysisRun(walletAddress, walletData);

    console.log(
      `${logPrefix} Completed fresh analysis in ${Date.now() - started}ms (txs=${walletData.totalTransactions ?? walletData.transactions?.length ?? 0})`
    );

    await trackApiEvent({
      endpoint: "analyze",
      status: "success",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: { cached: false, isExternal: target.isExternal }
    });

    return analysisResponse(walletAddress, walletData, false, target.isOwnWallet);
  } catch (error) {
    await trackApiEvent({
      endpoint: "analyze",
      status: "error",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: {
        message: error instanceof Error ? error.message : "Analysis failed."
      }
    });
    console.error(`${logPrefix} Failed after ${Date.now() - started}ms:`, error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Analysis failed.", code: "AGENT_ERROR" },
      { status: 500 }
    );
  }
}
