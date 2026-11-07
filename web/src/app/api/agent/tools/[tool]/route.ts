// FILE: src/app/api/agent/tools/[tool]/route.ts
// One route for all ten intelligence tools: POST /api/agent/tools/{tool_name}
//   free tools            -> no payment, per-IP rate limit
//   paid tools, in the app -> free (same-origin dashboard calls), tighter per-IP rate limit
//   paid tools, external   -> x402 payment at the price from lib/agent/toolPricing.ts
import { assertPayment } from "@/lib/agent/x402";
import { runIntelTool, validateIntelToolInput } from "@/lib/agent/onfraServer";
import { getToolPriceUsdt, isIntelTool } from "@/lib/agent/toolPricing";
import { inAppPaidToolsFree, takeToolCall } from "@/lib/agent/toolLimit";
import { isBrowserSameOrigin } from "@/lib/guestLimit";
import { badRequest } from "@/lib/agent/validate";
import { trackApiEvent } from "@/lib/db/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ tool: string }> | { tool: string } };
type Access = "free" | "in-app" | "paid";

const STATUS_BY_CODE: Record<string, number> = { UNKNOWN_TOOL: 404, BAD_REQUEST: 400, NOT_FOUND: 404, TOOL_ERROR: 502 };

function rateLimited(retryAfterSec: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return Response.json(
    { error: `Too many requests from this connection. Try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`, code: "RATE_LIMITED" },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}

export async function POST(req: Request, ctx: Ctx) {
  const { tool } = await ctx.params;
  if (!isIntelTool(tool)) {
    return Response.json({ error: `Unknown tool "${tool}".`, code: "UNKNOWN_TOOL" }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body)) return badRequest("Body must be a JSON object.");

  // Reject bad input BEFORE taking any payment.
  const check = await validateIntelToolInput(tool, body);
  if (!check.ok) {
    return Response.json({ error: check.message, code: check.code, details: check.details }, { status: STATUS_BY_CODE[check.code] ?? 400 });
  }

  const priceUsdt = getToolPriceUsdt(tool);
  const paid = Number(priceUsdt) > 0;
  const inApp = req.headers.get("x-onfra-dashboard") === "true" && isBrowserSameOrigin(req);

  let access: Access = "free";
  let settlement: Record<string, unknown> | undefined;

  if (!paid) {
    const gate = takeToolCall(req, "free");
    if (!gate.ok) return rateLimited(gate.retryAfterSec);
  } else if (inApp && inAppPaidToolsFree()) {
    const gate = takeToolCall(req, "in_app_paid");
    if (!gate.ok) return rateLimited(gate.retryAfterSec);
    access = "in-app";
  } else {
    const payment = await assertPayment(req, "tool", { priceUsdt });
    if (!payment.ok) return payment.response;
    settlement = payment.settlement as unknown as Record<string, unknown>;
    access = "paid";
  }

  const started = Date.now();
  const wallet = typeof body.wallet_address === "string" ? body.wallet_address : undefined;
  // trackApiEvent's endpoint type may be a fixed list; widen it so the new tool names compile either way.
  const endpoint = `tool:${tool}` as unknown as Parameters<typeof trackApiEvent>[0]["endpoint"];

  try {
    const result = await runIntelTool(tool, body);
    await trackApiEvent({ endpoint, status: "success", walletAddress: wallet, durationMs: Date.now() - started, metadata: { access, priceUsdt, settlement } });
    const headers: Record<string, string> = {
      "Cache-Control": "no-store",
      "X-OnFRA-Access": access,
      "X-OnFRA-Price-USDT": access === "paid" ? priceUsdt : "0"
    };
    if (settlement?.method) headers["X-OnFRA-Settlement"] = String(settlement.method);
    if (settlement?.txHash) headers["X-OnFRA-Settlement-Tx"] = String(settlement.txHash);
    return Response.json(result, { headers });
  } catch (error) {
    const err = error as { name?: string; code?: string; message?: string; details?: unknown };
    const known = err?.name === "IntelToolError" && err.code ? err.code : null;
    await trackApiEvent({ endpoint, status: "error", walletAddress: wallet, durationMs: Date.now() - started, metadata: { message: err?.message ?? "Tool failed.", access } });
    console.error(`[tools/${tool}] failed after ${Date.now() - started}ms:`, error);
    return Response.json(
      { error: err?.message ?? "Tool failed.", code: known ?? "AGENT_ERROR", ...(err?.details ? { details: err.details } : {}) },
      { status: known ? STATUS_BY_CODE[known] ?? 500 : 500 }
    );
  }
}
