import { buildAnalysisResponse } from "@/lib/agent/analysisResponse";
import { assertPayment } from "@/lib/agent/x402";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import { mockWallet } from "@/data/mockWallet";

/** External wallet analysis — 0.05 USDT via x402 when enforcement is enabled. */
export async function POST(req: Request) {
  const paymentBlock = assertPayment(req, "analysis");
  if (paymentBlock) return paymentBlock;
  const body = parseJsonBody<{ walletAddress?: string; months?: number }>(
    await req.json().catch(() => null)
  );
  if (!body) return badRequest("Invalid JSON body.");

  const walletAddress = body.walletAddress || mockWallet.walletAddress;
  if (!isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  return Response.json(buildAnalysisResponse(walletAddress));
}
