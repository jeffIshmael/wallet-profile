export type ChatAgentContext = {
  callerWallet: string;
  targetWallet: string;
  isOwnWallet: boolean;
};

export type ChatAgentResult = {
  text: string;
  toolsUsed: string[];
  source?: "cache" | "tool" | "openai";
};

export type ChatStatusCallback = (status: string) => void;

export const CHAT_LOADING_STAGES = [
  "Validating query…",
  "Fetching wallet data…",
  "Calculating metrics…",
  "Generating response…"
] as const;

const TOOL_STATUS: Record<string, string> = {
  fetch_onchain_data: "Fetching wallet details…",
  fetch_onchain_balances: "Fetching balances…",
  fetch_wallet_transactions: "Fetching transactions…",
  fetch_wallet_protocols: "Fetching protocol activity…",
  compute_financial_health: "Calculating financial health…",
  compute_reputation_score: "Calculating reputation score…",
  income_stability_analysis: "Calculating income metrics…",
  risk_exposure_breakdown: "Analyzing portfolio risk…",
  loan_capacity_estimator: "Estimating loan capacity…"
};

export function statusForTool(toolName: string): string {
  return TOOL_STATUS[toolName] ?? "Processing…";
}
