import { badRequest, isEvmAddress } from "@/lib/agent/validate";
import { getLatestWalletData } from "@/lib/db/analysis";
import { assertPayment } from "@/lib/agent/x402";

export async function GET(
  req: Request,
  { params }: { params: { address: string } }
) {
  const url = new URL(req.url);
  const callerAddressQuery = url.searchParams.get("callerAddress") ?? undefined;
  
  const walletAddress = params.address?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("address must be a valid 0x-prefixed EVM address.");
  }

  const isDashboard = req.headers.get("x-onfra-dashboard") === "true";
  const callerAddress = isDashboard ? callerAddressQuery?.trim() : undefined;
  const isOwnWallet = callerAddress ? callerAddress.toLowerCase() === walletAddress.toLowerCase() : false;

  const paymentBlock = await assertPayment(req, "external", {
    skipPayment: isDashboard || isOwnWallet,
    skipReason: isDashboard ? "platform calling" : "own-wallet cached read"
  });
  if (paymentBlock) return paymentBlock;


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
