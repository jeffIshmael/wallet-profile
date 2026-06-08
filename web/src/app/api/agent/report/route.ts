import { assertPayment } from "@/lib/agent/x402";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import { getAppBaseUrl } from "@/lib/blockchain/constants";
import { mockWallet } from "@/data/mockWallet";

export async function POST(req: Request) {
  const paymentBlock = assertPayment(req, "report");
  if (paymentBlock) return paymentBlock;

  const body = parseJsonBody<{ walletAddress?: string }>(await req.json().catch(() => null));
  if (!body) return badRequest("Invalid JSON body.");

  const walletAddress = body.walletAddress || mockWallet.walletAddress;
  if (!isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  const reportId = "REP-7A30EF182A4729CB";

  return Response.json({
    status: "completed",
    reportId,
    walletAddress: walletAddress.toLowerCase(),
    verificationCode: mockWallet.verificationCode,
    verificationEndpoint: `${getAppBaseUrl()}/api/agent/verify/${reportId}`,
    reportHash: mockWallet.attestation.hash,
    createdAt: new Date().toISOString()
  });
}
