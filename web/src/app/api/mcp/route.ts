// FILE: src/app/api/mcp/route.ts
// MCP (Streamable HTTP) server for OnFRA -> https://app.onfra.xyz/api/mcp
// Wraps the same logic as /api/agent/tools/[tool], called in-process so
// per-IP rate limits and x402 payments behave exactly like the REST route.
//
// Built for mcp-handler 2.x + @modelcontextprotocol/server 2.x + zod 4.
// NOTE: input schemas deliberately avoid .regex()/pattern. 8004scan's "Try agent"
// marks any tool whose JSON Schema contains "pattern" as Unavailable. Format checks
// (wallet 0x + 40 hex, tx hash 0x + 64 hex) still happen server-side in
// validateIntelToolInput, before any payment is taken.
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { assertPayment } from "@/lib/agent/x402";
import { runIntelTool, validateIntelToolInput } from "@/lib/agent/onfraServer";
import { getToolPriceUsdt, isIntelTool } from "@/lib/agent/toolPricing";
import { takeToolCall } from "@/lib/agent/toolLimit";
import { trackApiEvent } from "@/lib/db/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Accept, Authorization, mcp-session-id, mcp-protocol-version, Last-Event-ID, X-PAYMENT, x-payment, PAYMENT-SIGNATURE",
  "Access-Control-Expose-Headers": "mcp-session-id, mcp-protocol-version",
  "Access-Control-Max-Age": "86400"
};

type ToolResult = { isError?: boolean; content: { type: "text"; text: string }[] };

const out = (data: unknown, isError = false): ToolResult => ({
  ...(isError ? { isError: true } : {}),
  content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }]
});

type TrackArgs = Parameters<typeof trackApiEvent>[0];

// Usage logging must never break a tool result. ApiEvent.walletAddress is a foreign key,
// so logging fails for wallets that are not in the database (every external wallet).
// Retry once without the FK field (wallet kept in metadata), and never throw.
async function safeTrack(args: TrackArgs): Promise<void> {
  try {
    await trackApiEvent(args);
  } catch {
    try {
      const retry = {
        ...args,
        walletAddress: undefined,
        metadata: { ...(args.metadata as Record<string, unknown> | undefined), wallet_address: args.walletAddress }
      } as TrackArgs;
      await trackApiEvent(retry);
    } catch (e) {
      console.error("[mcp] trackApiEvent failed (ignored):", e);
    }
  }
}

async function runTool(req: Request, tool: string, args: Record<string, unknown>): Promise<ToolResult> {
  if (!isIntelTool(tool)) return out({ error: `Unknown tool "${tool}".`, code: "UNKNOWN_TOOL" }, true);

  // Reject bad input BEFORE taking any payment.
  const check = await validateIntelToolInput(tool, args);
  if (!check.ok) return out({ error: check.message, code: check.code, details: check.details }, true);

  const priceUsdt = getToolPriceUsdt(tool);
  const paid = Number(priceUsdt) > 0;
  let access: "free" | "paid" = "free";
  let settlement: Record<string, unknown> | undefined;

  if (!paid) {
    const gate = takeToolCall(req, "free");
    if (!gate.ok) {
      return out({ error: "Too many requests from this connection.", code: "RATE_LIMITED", retryAfterSec: gate.retryAfterSec }, true);
    }
  } else {
    // MCP has no in-app bypass: external callers pay via x402 (X-PAYMENT header on the MCP request).
    const payment = await assertPayment(req, "tool", { priceUsdt });
    if (!payment.ok) return out(await payment.response.text(), true); // 402 body with payTo/asset/amount
    settlement = payment.settlement as unknown as Record<string, unknown>;
    access = "paid";
  }

  const started = Date.now();
  const wallet = typeof args.wallet_address === "string" ? args.wallet_address : undefined;
  const endpoint = `tool:${tool}` as unknown as Parameters<typeof trackApiEvent>[0]["endpoint"];

  try {
    const result = await runIntelTool(tool, args);
    await safeTrack({
      endpoint, status: "success", walletAddress: wallet, durationMs: Date.now() - started,
      metadata: { access, priceUsdt, settlement, via: "mcp" }
    });
    return out(result);
  } catch (error) {
    const err = error as { message?: string; code?: string; details?: unknown };
    await safeTrack({
      endpoint, status: "error", walletAddress: wallet, durationMs: Date.now() - started,
      metadata: { message: err?.message ?? "Tool failed.", access, via: "mcp" }
    });
    console.error(`[mcp/${tool}] failed:`, error);
    return out({ error: err?.message ?? "Tool failed.", code: err?.code ?? "AGENT_ERROR", ...(err?.details ? { details: err.details } : {}) }, true);
  }
}

// ---- tool definitions (mirror your mcp.json) ----
// No .regex() anywhere: it would emit a JSON Schema "pattern", which 8004scan rejects.
const wallet = z.string().describe("Wallet address to analyze: 0x followed by 40 hex characters.");
const chain = z.enum(["celo"]).describe("Blockchain. Celo today.");
const period = z.string().optional().describe("7d, 30d, 90d, 1y or all-time.");

const TOOLS: { name: string; description: string; shape: Record<string, z.ZodType> }[] = [
  {
    name: "analyze_wallet",
    description: "Financial intelligence profile of a wallet: overview, summary, tokens, activity, insights. Free.",
    shape: { wallet_address: wallet, chain, period }
  },
  {
    name: "get_cash_flow_summary",
    description: "Inflow, outflow and net flow for a period, with counts, daily averages and trend. Free.",
    shape: {
      wallet_address: wallet, chain,
      period: z.string().describe("7d, 30d, 90d or 1y. Ignored if start_date and end_date are given."),
      start_date: z.string().optional().describe("YYYY-MM-DD"),
      end_date: z.string().optional().describe("YYYY-MM-DD"),
      currency: z.string().optional().describe("Reporting currency, default USD.")
    }
  },
  {
    name: "get_token_balances",
    description: "Current token holdings with USD valuation and spam filtering. Free.",
    shape: { wallet_address: wallet, chain, include_spam: z.boolean().optional(), include_prices: z.boolean().optional() }
  },
  {
    name: "get_token_breakdown",
    description: "How activity is distributed across tokens by balance, received, sent or volume. Free.",
    shape: { wallet_address: wallet, chain, period, metric: z.enum(["balance", "received", "sent", "volume"]).optional() }
  },
  {
    name: "compare_periods",
    description: "Compares two time windows (inflow, outflow, net flow, tx count) with % change. Free.",
    shape: {
      wallet_address: wallet, chain,
      current_period: z.string().describe("e.g. 30d, 2026-10, or YYYY-MM-DD/YYYY-MM-DD"),
      previous_period: z.string().describe("Same formats as current_period."),
      metrics: z.array(z.enum(["inflow", "outflow", "net_flow", "transaction_count"])).optional()
    }
  },
  {
    name: "get_spending_breakdown",
    description: "Where outgoing money went, grouped by token, counterparty, protocol or category. Free.",
    shape: {
      wallet_address: wallet, chain,
      period: z.string().describe("7d, 30d, 90d, 1y or all-time."),
      group_by: z.enum(["token", "counterparty", "protocol", "category"]).optional()
    }
  },
  {
    name: "get_dominant_counterparties",
    description: "Ranks the addresses and entities a wallet interacts with most. Free.",
    shape: {
      wallet_address: wallet, chain, period,
      limit: z.number().int().min(1).max(50).optional(),
      sort_by: z.enum(["volume", "frequency"]).optional()
    }
  },
  {
    name: "get_wallet_activity",
    description: "Wallet activity level: tx count, active days, first/last activity, pattern. Free.",
    shape: { wallet_address: wallet, chain, period }
  },
  {
    name: "generate_transaction_statement",
    description: "PDF or CSV statement pinned to IPFS. PAID: 0.01 USDT via x402 (send X-PAYMENT header; otherwise a 402 payment payload is returned).",
    shape: {
      wallet_address: wallet, chain,
      period: z.string().describe("30d, 90d or 1y."),
      format: z.enum(["pdf", "csv"]).optional(),
      currency: z.string().optional()
    }
  },
  {
    name: "explain_transaction",
    description: "Plain-language explanation of a transaction. PAID: 0.02 USDT via x402 (send X-PAYMENT header; otherwise a 402 payment payload is returned).",
    shape: {
      transaction_hash: z.string().describe("Transaction hash: 0x followed by 64 hex characters."),
      chain,
      wallet_address: wallet.optional(),
      use_trace: z.boolean().optional()
    }
  }
];

async function handle(req: Request): Promise<Response> {
  // Built per request so tool callbacks can see the original request (IP, payment headers).
  const handler = createMcpHandler((server) => {
    for (const t of TOOLS) {
      server.registerTool(
        t.name,
        { description: t.description, inputSchema: z.object(t.shape) },
        async (args) => runTool(req, t.name, args as Record<string, unknown>)
      );
    }
  });

  const res = await handler(req);
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export { handle as GET, handle as POST, handle as DELETE };