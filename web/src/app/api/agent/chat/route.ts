import { runAgentChat } from "@/lib/agent/onfraServer";
import { insufficientBalanceError } from "@/lib/agent/apiErrors";
import { assertPayment, getTierPriceUsdt } from "@/lib/agent/x402";
import { assertSufficientUsdtBalance } from "@/lib/agent/usdtBalance";
import { resolveChatQueryTarget } from "@/lib/agent/walletQuery";
import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";
import {
  appendChatMessages,
  getChatHistory,
  getOrCreateChatSession
} from "@/lib/db/chat";
import { trackApiEvent } from "@/lib/db/events";
import { stripMarkdown } from "@/lib/chat/formatChatMessage";

const AGENT_CHAT_TIMEOUT_MS = 90_000;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`)), timeoutMs)
    )
  ]);
}

export async function POST(req: Request) {
  const body = parseJsonBody<{
    message?: string;
    walletAddress?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
    sessionId?: string;
  }>(await req.json().catch(() => null));
  if (!body?.message?.trim()) return badRequest("message is required.");

  const callerWallet = body.walletAddress?.trim();
  if (!callerWallet || !isEvmAddress(callerWallet)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  const userMessage = body.message.trim();
  const queryTarget = resolveChatQueryTarget(userMessage, callerWallet);
  if (!queryTarget.ok) {
    return Response.json(
      { error: queryTarget.error, code: queryTarget.code },
      { status: 400 }
    );
  }

  const { target } = queryTarget;
  const priceUsdt = getTierPriceUsdt("external");

  if (target.isExternal) {
    try {
      const balanceCheck = await assertSufficientUsdtBalance(callerWallet, priceUsdt);
      if (!balanceCheck.ok) {
        return insufficientBalanceError(balanceCheck.balance, priceUsdt);
      }
    } catch (error) {
      console.warn("[chat] USDT balance pre-check failed:", error);
    }
  }

  const paymentBlock = await assertPayment(req, "external", {
    skipPayment: target.isOwnWallet
  });
  if (paymentBlock) return paymentBlock;

  const started = Date.now();

  try {
    const session = await getOrCreateChatSession(callerWallet);
    const history = body.history ?? [];

    const response = await withTimeout(
      runAgentChat(
        [...history, { role: "user", content: userMessage }],
        {
          callerWallet: target.callerWallet,
          targetWallet: target.targetWallet,
          isOwnWallet: target.isOwnWallet
        }
      ),
      AGENT_CHAT_TIMEOUT_MS,
      "Chat agent"
    );

    await appendChatMessages(session.id, [
      { role: "user", content: userMessage },
      { role: "assistant", content: stripMarkdown(response.text) }
    ]);

    await trackApiEvent({
      endpoint: "chat",
      status: "success",
      walletAddress: callerWallet,
      durationMs: Date.now() - started,
      metadata: {
        targetWallet: target.targetWallet,
        isExternal: target.isExternal,
        toolsUsed: response.toolsUsed
      }
    });

    return Response.json({
      sessionId: session.id,
      walletAddress: callerWallet.toLowerCase(),
      targetWallet: target.targetWallet,
      isOwnWallet: target.isOwnWallet,
      message: userMessage,
      response: stripMarkdown(response.text),
      toolsUsed: response.toolsUsed,
      source: response.source,
      x402Billing: target.isOwnWallet
        ? { chargedUsdt: "0", token: "USDT", chain: "celo", free: true }
        : { chargedUsdt: priceUsdt, token: "USDT", chain: "celo", free: false }
    });
  } catch (error) {
    await trackApiEvent({
      endpoint: "chat",
      status: "error",
      walletAddress: callerWallet,
      durationMs: Date.now() - started,
      metadata: {
        message: error instanceof Error ? error.message : "Chat failed."
      }
    });
    console.error("[chat] OnFRA agent failed:", error);
    return Response.json(
      {
        walletAddress: callerWallet.toLowerCase(),
        message: userMessage,
        code: "AGENT_ERROR",
        error:
          error instanceof Error && error.message.includes("unavailable")
            ? "Wallet Profile AI is temporarily busy. Your dashboard data is still available — please try again in a moment."
            : error instanceof Error
              ? error.message
              : "Wallet Profile AI is temporarily unavailable. Please try again."
      },
      { status: 503 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("walletAddress")?.trim();

  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress query param must be a valid 0x-prefixed EVM address.");
  }

  try {
    const history = await getChatHistory(walletAddress);
    return Response.json(history);
  } catch (error) {
    console.error("[chat] Failed to load history:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load chat history." },
      { status: 500 }
    );
  }
}
