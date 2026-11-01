/**
 * Free dashboard lookups: guards for wallet analyses that skip x402 payment.
 *
 * The limiter is in-memory, so it is per server instance. That is fine in development and on a
 * single server. On serverless or several instances, swap the Map for Redis/Upstash.
 */

type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = Number(
  process.env.GUEST_ANALYZE_LIMIT ?? (process.env.NODE_ENV === "production" ? 12 : 1000)
);
const buckets = new Map<string, Bucket>();

export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** Counts one fresh analysis for this caller. Cached results should not call this. */
export function takeFreeLookup(req: Request): { ok: true } | { ok: false; retryAfterSec: number } {
  const key = clientIp(req);
  const now = Date.now();

  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (bucket.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}

/**
 * True when the request came from a page on this site (a browser).
 * The x-onfra-dashboard header alone can be copied by anyone, so we also require this.
 * It raises the bar but does not stop a determined script; the rate limit does that.
 */
export function isBrowserSameOrigin(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site) return site === "same-origin";

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return false;
}

/** Set FREE_DASHBOARD_LOOKUPS=false to make every non-own wallet lookup paid again. */
export function freeDashboardLookupsEnabled(): boolean {
  return process.env.FREE_DASHBOARD_LOOKUPS !== "false";
}