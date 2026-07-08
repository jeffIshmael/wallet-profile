import { runDashboardAnalysis } from "@/lib/agent/onfraServer";
import { insufficientBalanceError } from "@/lib/agent/apiErrors";
import { assertPayment, getTierPriceUsdt } from "@/lib/agent/x402";
import { assertSufficientUsdtBalance } from "@/lib/agent/usdtBalance";
import { resolveAnalysisTarget } from "@/lib/agent/walletQuery";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import { APP_BASE_URL, ONCHAIN_REPORTER_PROXY } from "@/lib/blockchain/constants";
import { getCachedWalletData, saveAnalysisRun } from "@/lib/db/analysis";
import { trackApiEvent } from "@/lib/db/events";
import { listReportsForWallet } from "@/lib/db/reports";
import { buildLenderScreenResult } from "@/lib/lender/underwriting";

/** Lender underwriting screen — lender-friendly trust + reputation + income + capacity. */
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

  if (!body.callerAddress?.trim()) {
    return badRequest("callerAddress is required — the lender wallet paying for the screen.");
  }

  if (!isEvmAddress(body.callerAddress.trim())) {
    return badRequest("callerAddress must be a valid 0x-prefixed EVM address.");
  }

  const target = resolveAnalysisTarget(walletAddress, body.callerAddress.trim());
  const priceUsdt = getTierPriceUsdt("external");

  if (!target.isExternal) {
    return badRequest(
      "Lender screen requires screening a borrower wallet different from callerAddress."
    );
  }

  try {
    const balanceCheck = await assertSufficientUsdtBalance(target.callerWallet, priceUsdt);
    if (!balanceCheck.ok) {
      return insufficientBalanceError(balanceCheck.balance, priceUsdt);
    }
  } catch (error) {
    console.warn("[lender/screen] USDT balance pre-check failed:", error);
  }

  const paymentBlock = await assertPayment(req, "external", {
    skipPayment: false,
    skipReason: "lender screen"
  });
  if (paymentBlock) return paymentBlock;

  const logPrefix = `[lender/screen ${walletAddress.slice(0, 10)}…]`;
  const started = Date.now();
  console.log(`${logPrefix} Starting (caller=${target.callerWallet.slice(0, 10)}…)`);

  try {
    let walletData = !body.force ? await getCachedWalletData(walletAddress) : null;
    let cached = Boolean(walletData);

    if (!walletData) {
      walletData = await runDashboardAnalysis(walletAddress, { force: body.force });
      await saveAnalysisRun(walletAddress, walletData);
      cached = false;
    }

    const reports = await listReportsForWallet(walletAddress, 1);
    const latestReportId = reports[0]?.onchainReportId ?? null;

    const screen = buildLenderScreenResult(walletData, {
      appBaseUrl: APP_BASE_URL,
      onchainReporterContract: ONCHAIN_REPORTER_PROXY,
      latestReportId
    });

    const isTrustworthy = screen.recommendation === "approve";
    console.log(
      `${logPrefix} trust=${isTrustworthy ? "TRUSTWORTHY" : "NOT_TRUSTWORTHY"} in ${
        Date.now() - started
      }ms (cached=${cached})`
    );

    await trackApiEvent({
      endpoint: "lender_screen",
      status: "success",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: {
        cached,
        trust: isTrustworthy,
        callerAddress: target.callerWallet
      }
    });

    // IMPORTANT: we do NOT expose approve/review/decline. Lenders can make their own
    // decision using the data we return (trustworthiness, reputation, income, capacity).
    return Response.json({
      status: screen.status,
      walletAddress: screen.walletAddress,
      screenedAt: screen.screenedAt,
      trust: { isTrustworthy },
      scores: screen.scores,
      income: {
        label: screen.income.label,
        monthlyEstimateUsd: screen.income.monthlyEstimateUsd,
        weeklyConsistencyPct: screen.income.weeklyConsistencyPct,
        recurringIncome: screen.income.recurringIncome
      },
      lending: {
        recommendedMinUsd: screen.lending.recommendedMinUsd,
        recommendedMaxUsd: screen.lending.recommendedMaxUsd,
        confidence: screen.lending.confidence,
        riskCategory: screen.lending.riskCategory
      },
      verification: screen.verification,
      cached,
      x402Billing: {
        chargedUsdt: priceUsdt,
        token: "USDT",
        chain: "celo",
        payer: target.callerWallet
      }
    });
  } catch (error) {
    await trackApiEvent({
      endpoint: "lender_screen",
      status: "error",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: {
        message: error instanceof Error ? error.message : "Lender screen failed."
      }
    });
    console.error(`${logPrefix} Failed after ${Date.now() - started}ms:`, error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Lender screen failed.", code: "AGENT_ERROR" },
      { status: 500 }
    );
  }
}
