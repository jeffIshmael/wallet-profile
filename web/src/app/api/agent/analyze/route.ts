import {
  buildFullAnalysisPayload,
  parseAnalyzeFields,
  pickAnalysisFields,
  type AnalyzeFieldKey
} from "@/lib/agent/analysisSignals";
import { runDashboardAnalysis } from "@/lib/agent/onfraServer";
import { insufficientBalanceError } from "@/lib/agent/apiErrors";
import { assertPayment, getTierPriceUsdt } from "@/lib/agent/x402";
import { assertSufficientUsdtBalance } from "@/lib/agent/usdtBalance";
import { resolveAnalysisTarget } from "@/lib/agent/walletQuery";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import {
  getCachedWalletData,
  getLatestAnalysisRun,
  saveAnalysisRun
} from "@/lib/db/analysis";
import { trackApiEvent } from "@/lib/db/events";
import type { WalletData } from "@/types/walletData";

function analysisResponse(
  walletAddress: string,
  walletData: WalletData,
  cached: boolean,
  isOwnWallet: boolean,
  fields: AnalyzeFieldKey[] | null,
  fetchedAt?: string
) {
  const payload = buildFullAnalysisPayload(
    walletAddress,
    walletData,
    cached,
    isOwnWallet,
    fetchedAt
  );

  if (fields) {
    return Response.json(pickAnalysisFields(payload, fields));
  }

  return Response.json(payload);
}

/** Wallet analysis powered by the OnFRA LangChain agent. */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const body = parseJsonBody<{
    walletAddress?: string;
    callerAddress?: string;
    months?: number;
    force?: boolean;
    fields?: string | string[];
  }>(await req.json().catch(() => null));
  if (!body) return badRequest("Invalid JSON body.");

  let fields: AnalyzeFieldKey[] | null = null;
  try {
    fields = parseAnalyzeFields(body.fields ?? url.searchParams.get("fields"));
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Invalid fields.");
  }

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
    skipPayment: false,
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
        const run = await getLatestAnalysisRun(walletAddress);
        console.log(`${logPrefix} Cache hit in ${Date.now() - started}ms`);
        await trackApiEvent({
          endpoint: "analyze",
          status: "success",
          walletAddress,
          durationMs: Date.now() - started,
          metadata: { cached: true, isExternal: target.isExternal, fields }
        });
        return analysisResponse(
          walletAddress,
          cached,
          true,
          target.isOwnWallet,
          fields,
          run?.createdAt.toISOString()
        );
      }
    }

    const walletData = await runDashboardAnalysis(walletAddress, { force: body.force });
    const run = await saveAnalysisRun(walletAddress, walletData);

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

    return analysisResponse(
      walletAddress,
      walletData,
      false,
      target.isOwnWallet,
      fields,
      run.createdAt.toISOString()
    );
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
