import { signalMeta } from "@/lib/agent/analysisSignals";
import { badRequest, isEvmAddress } from "@/lib/agent/validate";
import { getCachedWalletData, getLatestAnalysisRun } from "@/lib/db/analysis";

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  const walletAddress = params.address?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("address must be a valid 0x-prefixed EVM address.");
  }

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
