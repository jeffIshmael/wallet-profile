import { runAgentChat } from "@/lib/agent/onfraServer";
import { assertPayment } from "@/lib/agent/x402";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";

export async function POST(req: Request) {
  const paymentBlock = assertPayment(req, "chat");
  if (paymentBlock) return paymentBlock;

  const body = parseJsonBody<{ message?: string; walletAddress?: string; history?: Array<{ role: "user" | "assistant"; content: string }> }>(
    await req.json().catch(() => null)
  );
  if (!body?.message?.trim()) return badRequest("message is required.");

  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  try {
    const history = body.history ?? [];
    const response = await runAgentChat([
      ...history,
      { role: "user", content: body.message.trim() }
    ]);

    return Response.json({
      walletAddress: walletAddress.toLowerCase(),
      message: body.message,
      response,
      x402Billing: { chargedUsdt: "0.05", token: "USDT", chain: "celo" }
    });
  } catch (error) {
    console.error("[chat] OnFRA agent failed:", error);
    return Response.json(
      {
        walletAddress: walletAddress.toLowerCase(),
        message: body.message,
        response:
          error instanceof Error
            ? error.message
            : "Wallet Profile AI is temporarily unavailable. Please try again.",
        x402Billing: { chargedUsdt: "0.05", token: "USDT", chain: "celo" }
      },
      { status: 500 }
    );
  }
}
