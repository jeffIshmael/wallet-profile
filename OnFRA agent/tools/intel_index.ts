// FILE: tools/intel_index.ts
// One import to register every new tool. Existing tools stay as they are.
import { analyzeWallet, getWalletActivity, getTokenBalances, getTokenBreakdown } from "./intel_wallet.js";
import { getCashFlowSummary, compareWalletPeriods, getDominantCounterparties, getSpendingBreakdown } from "./intel_flows.js";
import { generateTransactionStatement } from "./intel_statement.js";
import { explainTransaction } from "./intel_explain.js";

export const intelTools = [
  analyzeWallet, getCashFlowSummary, getTokenBalances, getTokenBreakdown, getSpendingBreakdown,
  compareWalletPeriods, getDominantCounterparties, getWalletActivity, explainTransaction, generateTransactionStatement,
];

// Prices live in middleware/pricing.ts (modes: free | launch | paid, plus per-tool overrides).
export { getToolPrice, pricingTable } from "../middleware/pricing.js";
