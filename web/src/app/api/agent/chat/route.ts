import { assertPayment } from "@/lib/agent/x402";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import { mockWallet } from "@/data/mockWallet";

export async function POST(req: Request) {
  const paymentBlock = assertPayment(req, "chat");
  if (paymentBlock) return paymentBlock;

  const body = parseJsonBody<{ message?: string; walletAddress?: string }>(
    await req.json().catch(() => null)
  );
  if (!body?.message?.trim()) return badRequest("message is required.");

  const walletAddress = body.walletAddress || mockWallet.walletAddress;
  if (!isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  const lower = body.message.toLowerCase();
  let reply =
    "Wallet Profile AI can analyze financial health, reputation, loan capacity, and portfolio risk for Celo wallets.";

  if (lower.includes("health") || lower.includes("score")) {
    reply = `Financial health for ${walletAddress} is ${mockWallet.metrics.financialHealth.score}% with income stability at ${mockWallet.metrics.financialHealth.breakdown.incomeStability}/100.`;
  } else if (lower.includes("reputation") || lower.includes("trust")) {
    reply = `Reputation score is ${mockWallet.metrics.reputation.score}/100 (${mockWallet.metrics.reputation.category}). ${mockWallet.metrics.reputation.rationale}`;
  } else if (lower.includes("loan") || lower.includes("borrow")) {
    reply = `Safe borrowing range is ${mockWallet.metrics.loanCapacity.range} with ${mockWallet.metrics.loanCapacity.confidence} confidence.`;
  }

  return Response.json({
    walletAddress,
    message: body.message,
    response: reply,
    x402Billing: { chargedUsdt: "0.05", token: "USDT", chain: "celo" }
  });
}
