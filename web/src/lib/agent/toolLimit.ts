// FILE: src/lib/agent/toolLimit.ts
// Per-IP hourly limits for the intelligence tools.
//   free        : free tools called by anyone
//   in_app_paid : paid tools used for free from inside the OnFRA app (each call can cost us a data purchase)
// In-memory, so per server instance. On several instances or serverless, swap the Map for Redis/Upstash (same note as guestLimit.ts).
import { clientIp } from "@/lib/guestLimit";

export type ToolLimitKind = "free" | "in_app_paid";
type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60 * 60 * 1000;
const prod = process.env.NODE_ENV === "production";
const MAX: Record<ToolLimitKind, number> = {
  free: Number(process.env.TOOL_FREE_LIMIT ?? (prod ? 120 : 5000)),
  in_app_paid: Number(process.env.TOOL_IN_APP_PAID_LIMIT ?? (prod ? 10 : 500))
};
const buckets = new Map<string, Bucket>();

export function takeToolCall(req: Request, kind: ToolLimitKind): { ok: true } | { ok: false; retryAfterSec: number } {
  const key = `${kind}:${clientIp(req)}`;
  const now = Date.now();
  if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (bucket.count >= MAX[kind]) return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  bucket.count += 1;
  return { ok: true };
}

/** Set FREE_IN_APP_PAID_TOOLS=false to charge everyone, including the app, for the paid tools. */
export const inAppPaidToolsFree = () => process.env.FREE_IN_APP_PAID_TOOLS !== "false";
