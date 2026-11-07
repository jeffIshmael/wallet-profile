// FILE: middleware/pricing.ts
// One place that decides what each new intelligence tool costs. Flip modes or override single tools with env vars,
// no code change needed. The web API routes can import getToolPrice()/pricingTable() so HTTP 402 prices match.
//
//   ONFRA_PRICING_MODE = free | launch | paid        (default: launch)
//     free   -> every tool free
//     launch -> only explain_transaction (0.02) and generate_transaction_statement (0.01) cost money
//     paid   -> those two, plus 0.01 for every other intelligence tool
//   ONFRA_PRICING_JSON = {"explain_transaction":0.03,"get_wallet_activity":0}   (per-tool override, wins over the mode)
//
// Legacy tools (compute_financial_health etc.) are not priced here; they keep their existing billing.

export const INTEL_TOOL_NAMES = [
  "analyze_wallet", "get_cash_flow_summary", "get_token_balances", "get_token_breakdown", "get_spending_breakdown",
  "compare_periods", "get_dominant_counterparties", "get_wallet_activity", "explain_transaction", "generate_transaction_statement",
] as const;

const LAUNCH_PRICES: Record<string, number> = { explain_transaction: 0.02, generate_transaction_statement: 0.01 };
const PAID_DEFAULT_PRICE = 0.01;

export type PricingMode = "free" | "launch" | "paid";

export function pricingMode(): PricingMode {
  const m = (process.env.ONFRA_PRICING_MODE ?? "launch").toLowerCase();
  return m === "free" || m === "paid" ? m : "launch";
}

function overrides(): Record<string, number> {
  try {
    const parsed = JSON.parse(process.env.ONFRA_PRICING_JSON ?? "{}") as Record<string, unknown>;
    return Object.fromEntries(Object.entries(parsed).filter(([, v]) => typeof v === "number" && Number.isFinite(v) && v >= 0)) as Record<string, number>;
  } catch {
    return {};
  }
}

export function getToolPrice(toolName: string): number {
  const o = overrides();
  if (toolName in o) return o[toolName];
  if (!(INTEL_TOOL_NAMES as readonly string[]).includes(toolName)) return 0;
  const mode = pricingMode();
  if (mode === "free") return 0;
  if (mode === "launch") return LAUNCH_PRICES[toolName] ?? 0;
  return LAUNCH_PRICES[toolName] ?? PAID_DEFAULT_PRICE;
}

export function pricingTable(): Record<string, number> {
  return Object.fromEntries(INTEL_TOOL_NAMES.map((n) => [n, getToolPrice(n)]));
}

/** One sentence for the system prompt, always in sync with the table above. */
export function describeIntelPricing(): string {
  const paid = INTEL_TOOL_NAMES.filter((n) => getToolPrice(n) > 0);
  if (paid.length === 0) return "All intelligence tools are currently free.";
  if (paid.length === INTEL_TOOL_NAMES.length && new Set(paid.map(getToolPrice)).size === 1) return `Every intelligence tool costs ${getToolPrice(paid[0])} USDT per call.`;
  return `Intelligence tools are free except: ${paid.map((n) => `${n} (${getToolPrice(n)} USDT)`).join(", ")}.`;
}
