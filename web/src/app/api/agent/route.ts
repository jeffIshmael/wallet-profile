import { NextResponse } from "next/server";
import { mockWallet } from "@/data/mockWallet";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { message?: string; walletAddress?: string };
  const walletAddress = body.walletAddress || mockWallet.walletAddress;

  return NextResponse.json({
    input: body.message ?? "Analyze wallet",
    walletAddress,
    response: {
      summary: "Wallet has strong reputation and low debt signals, with borrowing capacity limited by low income and NFT-heavy exposure.",
      financialHealth: mockWallet.metrics.financialHealth.score,
      reputation: mockWallet.metrics.reputation.score,
      x402Billing: {
        enabled: false,
        suggestedPrice: "0.05 USDT"
      }
    }
  });
}
