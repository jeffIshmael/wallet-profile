// FILE: chains/intel_router.ts
// Decides which questions go to the new tool-calling agent instead of the legacy intent router.
// INTEL_AGENT_MODE = auto (default) | always | off
//   auto   -> only questions that need a new tool (tx hash, compare, counterparties, spending, cash flow, activity,
//             balances, token breakdown, statement/CSV/PDF, wallet overview). Everything else keeps the legacy path.
//   always -> every question goes to the new agent (it can still call the legacy tools)
//   off    -> legacy behaviour only
export type IntelMode = "auto" | "always" | "off";

export const intelMode = (): IntelMode => {
  const m = (process.env.INTEL_AGENT_MODE ?? "auto").toLowerCase();
  return m === "always" || m === "off" ? m : "auto";
};

const PATTERNS: RegExp[] = [
  /\b0x[a-fA-F0-9]{64}\b/,                                                            // a transaction hash
  /\b(compare|compared|versus|vs\.?|month[- ]over[- ]month|than last (month|week|year)|previous (month|week|period))\b/i,
  /\bcounterpart(y|ies)\b|\b(who|which (addresses|wallets))\b.*\b(interact|send|sends|pay|paid|transact)/i,
  /\b(spending|expenses?)\b.*\b(breakdown|categor|by)\b|\bwhere did\b.*\b(money|funds|spend|go)\b|\bspending categor/i,
  /\b(cash ?flow|net flow|outflow|burn rate)\b/i,
  /\b(activity|active|dormant|how often|first transaction|last transaction|transaction count|how many transactions)\b/i,
  /\b(balance|balances|holdings?|holds?)\b/i,
  /\b(token breakdown|breakdown by token|dominant token|by volume)\b/i,
  /\b(statement|csv|pdf|download|export)\b/i,
  /\bwallet (profile|overview|summary)\b|\b(analy[sz]e|profile|overview|summary of)\b.*\bwallet\b/i,
];

export function shouldUseIntelAgent(message: string): boolean {
  const mode = intelMode();
  if (mode === "off") return false;
  if (mode === "always") return true;
  return PATTERNS.some((p) => p.test(message));
}
