import { extractSignalData, isSignalId, SIGNAL_IDS } from "@/lib/agent/analysisSignals";
import { badRequest, isEvmAddress } from "@/lib/agent/validate";
import { getCachedWalletData, getLatestAnalysisRun } from "@/lib/db/analysis";
import { assertPayment } from "@/lib/agent/x402";
import { trackApiEvent } from "@/lib/db/events";

export async function GET(
  req: Request,
  { params }: { params: { address: string; signal: string } }
) {
  const walletAddress = params.address?.trim();
  const signal = params.signal?.trim().toLowerCase();

  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("address must be a valid 0x-prefixed EVM address.");
  }

  const url = new URL(req.url);
  const callerAddressQuery = url.searchParams.get("callerAddress") ?? undefined;
  const isDashboard = req.headers.get("x-onfra-dashboard") === "true";
  const callerAddress = isDashboard ? callerAddressQuery?.trim() : undefined;
  const isOwnWallet = callerAddress ? callerAddress.toLowerCase() === walletAddress.toLowerCase() : false;

  const paymentBlock = await assertPayment(req, "external", {
    skipPayment: isDashboard || isOwnWallet,
    skipReason: isDashboard ? "platform calling" : "own-wallet cached read"
  });
  if (paymentBlock) return paymentBlock;

  if (!signal || !isSignalId(signal)) {
    return badRequest(
      `signal must be one of: ${SIGNAL_IDS.join(", ")}.`
    );
  }

  const started = Date.now();

  try {
    const walletData = await getCachedWalletData(walletAddress);
    if (!walletData) {
      const latest = await getLatestAnalysisRun(walletAddress);
      return Response.json(
        {
          error: "No cached analysis for this wallet.",
          hint: "POST /api/agent/analyze with walletAddress to refresh. Signal reads are free from cache.",
          walletAddress: walletAddress.toLowerCase(),
          signal,
          stale: Boolean(latest),
          lastAnalyzedAt: latest?.createdAt.toISOString() ?? null
        },
        { status: 404 }
      );
    }

    const run = await getLatestAnalysisRun(walletAddress);

    await trackApiEvent({
      endpoint: `signals/${signal}`,
      status: "success",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: { cached: true }
    });

    return Response.json({
      signal,
      walletAddress: walletAddress.toLowerCase(),
      cached: true,
      fetchedAt: run?.createdAt.toISOString() ?? new Date().toISOString(),
      expiresAt: run?.expiresAt.toISOString() ?? null,
      data: extractSignalData(signal, walletData)
    });
  } catch (error) {
    await trackApiEvent({
      endpoint: `signals/${signal}`,
      status: "error",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: {
        message: error instanceof Error ? error.message : "Signal lookup failed."
      }
    });
    console.error(`[signals/${signal}] Failed:`, error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Signal lookup failed." },
      { status: 500 }
    );
  }
}
