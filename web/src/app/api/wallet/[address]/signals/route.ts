import { signalMeta } from "@/lib/agent/analysisSignals";
import { badRequest, isEvmAddress } from "@/lib/agent/validate";
import { getCachedWalletData, getLatestAnalysisRun } from "@/lib/db/analysis";
import { assertPayment } from "@/lib/agent/x402";

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const walletAddress = params.address?.trim();
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

  const cached = await getCachedWalletData(walletAddress);
  const latest = await getLatestAnalysisRun(walletAddress);

  return Response.json({
    walletAddress: walletAddress.toLowerCase(),
    cached: Boolean(cached),
    lastAnalyzedAt: latest?.createdAt.toISOString() ?? null,
    expiresAt: latest?.expiresAt.toISOString() ?? null,
    signals: signalMeta(),
    hint: cached
      ? "GET /api/wallet/{address}/signals/{signal} for a single reputation field."
      : "POST /api/agent/analyze first, then read signals for free from cache."
  });
}
