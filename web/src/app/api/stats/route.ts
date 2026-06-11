import { badRequest, isEvmAddress } from "@/lib/agent/validate";
import { getPlatformStats, getWalletStats } from "@/lib/db/stats";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("walletAddress")?.trim();

  try {
    if (walletAddress) {
      if (!isEvmAddress(walletAddress)) {
        return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
      }
      const stats = await getWalletStats(walletAddress);
      return Response.json(stats);
    }

    const stats = await getPlatformStats();
    return Response.json(stats);
  } catch (error) {
    console.error("[stats] Failed to load stats:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load stats." },
      { status: 500 }
    );
  }
}
