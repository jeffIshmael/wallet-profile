import { badRequest, isEvmAddress } from "@/lib/agent/validate";
import { getLatestWalletData } from "@/lib/db/analysis";

export async function GET(
  _req: Request,
  { params }: { params: { address: string } }
) {
  const walletAddress = params.address?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("address must be a valid 0x-prefixed EVM address.");
  }

  try {
    const latest = await getLatestWalletData(walletAddress);
    if (!latest) {
      return Response.json({ walletAddress: walletAddress.toLowerCase(), walletData: null });
    }

    return Response.json({
      walletAddress: walletAddress.toLowerCase(),
      walletData: latest.walletData,
      cached: latest.fromCache,
      fetchedAt: latest.createdAt.toISOString()
    });
  } catch (error) {
    console.error("[wallet/analysis] Failed to load analysis:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load analysis." },
      { status: 500 }
    );
  }
}
