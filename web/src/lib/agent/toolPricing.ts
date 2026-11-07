// FILE: src/lib/agent/toolPricing.ts
// Price table for the OnFRA intelligence tools. Mirrors "OnFRA agent/middleware/pricing.ts" and reads the same env vars,
// so the agent and the API always agree.
//
//   ONFRA_PRICING_MODE = free | launch | paid        (default: launch)
//     free   -> every tool free
//     launch -> only explain_transaction (0.02) and generate_transaction_statement (0.01) cost money
//     paid   -> those two, plus 0.01 for every other tool
//   ONFRA_PRICING_JSON = {"explain_transaction":0.03,"get_wallet_activity":0}   (per-tool override, wins over the mode)

export const INTEL_TOOL_NAMES = [
  "analyze_wallet", "get_cash_flow_summary", "get_token_balances", "get_token_breakdown", "get_spending_breakdown",
  "compare_periods", "get_dominant_counterparties", "get_wallet_activity", "explain_transaction", "generate_transaction_statement"
] as const;
export type IntelToolName = (typeof INTEL_TOOL_NAMES)[number];

const LAUNCH_PRICES: Record<string, number> = { explain_transaction: 0.02, generate_transaction_statement: 0.01 };
const PAID_DEFAULT = 0.01;

export function isIntelTool(name: string): name is IntelToolName {
  return (INTEL_TOOL_NAMES as readonly string[]).includes(name);
}

function pricingMode(): "free" | "launch" | "paid" {
  const m = (process.env.ONFRA_PRICING_MODE ?? "launch").toLowerCase();
  return m === "free" || m === "paid" ? m : "launch";
}

function overrides(): Record<string, number> {
  try {
    const parsed = JSON.parse(process.env.ONFRA_PRICING_JSON ?? "{}") as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, v]) => typeof v === "number" && Number.isFinite(v) && v >= 0)
    ) as Record<string, number>;
  } catch {
    return {};
  }
}

const asUsdt = (n: number) => n.toFixed(6).replace(/0+$/, "").replace(/\.$/, "") || "0";

/** Price in USDT as a decimal string. "0" means free. */
export function getToolPriceUsdt(name: string): string {
  const o = overrides();
  if (name in o) return asUsdt(o[name]);
  if (!isIntelTool(name)) return "0";
  const mode = pricingMode();
  if (mode === "free") return "0";
  if (mode === "launch") return asUsdt(LAUNCH_PRICES[name] ?? 0);
  return asUsdt(LAUNCH_PRICES[name] ?? PAID_DEFAULT);
}

export const isPaidTool = (name: string) => Number(getToolPriceUsdt(name)) > 0;

export function pricingTable(): Record<string, string> {
  return Object.fromEntries(INTEL_TOOL_NAMES.map((n) => [n, getToolPriceUsdt(n)]));
}
