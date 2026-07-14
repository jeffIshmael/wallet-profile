import { NextResponse } from "next/server";
import { buildAnalysisResponse } from "@/lib/agent/analysisResponse";
import { mockWallet } from "@/data/mockWallet";
import { assertPayment } from "@/lib/agent/x402";

/** Legacy single-route handler — prefer /api/agent/analyze and /api/agent/chat. */
export async function POST(req: Request) {
  const paymentBlock = await assertPayment(req, "external");
  if (paymentBlock) return paymentBlock;

  const body = (await req.json().catch(() => ({}))) as { message?: string; walletAddress?: string };
  const walletAddress = body.walletAddress || mockWallet.walletAddress;
  const analysis = buildAnalysisResponse(walletAddress);

  return NextResponse.json({
    input: body.message ?? "Analyze wallet",
    walletAddress,
    response: {
      summary: analysis.aiDashboardSummary,
      financialHealth: analysis.financialHealthScore,
      reputation: analysis.reputationScore,
      x402Billing: {
        enabled: true,
        chargedUsdt: "0.01",
        token: "USDT",
        chain: "celo"
      }
    }
  });
}

