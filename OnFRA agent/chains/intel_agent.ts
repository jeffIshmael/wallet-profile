// FILE: chains/intel_agent.ts
// Tool-calling agent for the new intelligence tools (and, optionally, the legacy tools).
// The model picks tools, every tool call goes through withPricing() so billing follows middleware/pricing.ts,
// and failed calls are refunded. InsufficientBalanceError is rethrown so callers can show a top-up message.
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import { intelTools } from "../tools/intel_index.js";
import { computeFinancialHealth } from "../tools/compute_financial_health.js";
import { computeReputationScore } from "../tools/compute_reputation_score.js";
import { riskExposure } from "../tools/risk_exposure.js";
import { incomeStability } from "../tools/income_stability.js";
import { loanCapacity } from "../tools/loan_capacity.js";
import { fetchOnchainBalances } from "../tools/fetch_onchain_balances.js";
import { fetchOnchainData, fetchWalletTransactions, fetchWalletProtocols } from "../tools/fetch_onchain_data.js";
import { withPricing, InsufficientBalanceError } from "../middleware/x402_billing.js";
import { buildSystemPrompt } from "../prompts/system_prompt.js";

export type IntelAgentContext = { callerWallet: string; targetWallet: string; isOwnWallet: boolean };
export type IntelAgentResult = { text: string; toolsUsed: string[]; source: "openai" | "tool" };
export type IntelStatusCallback = (status: string) => void;

const LEGACY_TOOLS: any[] = [
  computeFinancialHealth, computeReputationScore, riskExposure, incomeStability, loanCapacity,
  fetchOnchainBalances, fetchOnchainData, fetchWalletTransactions, fetchWalletProtocols,
];

const STATUS: Record<string, string> = {
  analyze_wallet: "Analyzing wallet…",
  get_cash_flow_summary: "Calculating cash flow…",
  get_token_balances: "Reading balances…",
  get_token_breakdown: "Breaking down tokens…",
  get_spending_breakdown: "Analyzing spending…",
  compare_periods: "Comparing periods…",
  get_dominant_counterparties: "Finding top counterparties…",
  get_wallet_activity: "Checking activity…",
  explain_transaction: "Explaining the transaction…",
  generate_transaction_statement: "Generating your statement…",
};

const MAX_STEPS = Number(process.env.INTEL_AGENT_MAX_STEPS ?? 5);
const MAX_TOOL_CHARS = 12_000;
const clip = (s: string) => (s.length > MAX_TOOL_CHARS ? `${s.slice(0, MAX_TOOL_CHARS)}\n…[truncated]` : s);
const asText = (c: unknown) => (typeof c === "string" ? c : Array.isArray(c) ? c.map((p: any) => p?.text ?? "").join("") : String(c ?? "")).trim();

export async function runIntelAgent(
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  options: {
    apiKey?: string;
    context: IntelAgentContext;
    onStatus?: IntelStatusCallback;
    includeLegacy?: boolean;
    /** Test hooks: supply a pre-built model or tool list. */
    model?: { invoke: (messages: BaseMessage[]) => Promise<AIMessage> };
    tools?: any[];
  }
): Promise<IntelAgentResult> {
  const { context, onStatus } = options;
  const payer = () => context.callerWallet;
  const raw = options.tools ?? [...intelTools, ...((options.includeLegacy ?? true) ? LEGACY_TOOLS : [])];
  const tools = raw.map((t) => withPricing(t, payer));
  const byName = new Map<string, any>(tools.map((t) => [t.name, t]));

  let model = options.model;
  if (!model) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY is required for the intelligence agent");
    model = new ChatOpenAI({ model: process.env.INTEL_AGENT_MODEL ?? "gpt-4o-mini", apiKey, temperature: 0.1 }).bindTools(tools) as any;
  }

  const messages: BaseMessage[] = [
    new SystemMessage(buildSystemPrompt(context)),
    ...history.filter((h) => h.role !== "system").map((h) => (h.role === "user" ? new HumanMessage(h.content) : new AIMessage(h.content))),
  ];
  const used: string[] = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    const ai = (await (model as any).invoke(messages)) as AIMessage;
    const calls = ai.tool_calls ?? [];
    if (calls.length === 0) return { text: asText(ai.content), toolsUsed: used, source: "openai" };

    messages.push(ai);
    for (const call of calls) {
      const t = byName.get(call.name);
      let content: string;
      if (!t) {
        content = `Unknown tool "${call.name}".`;
      } else {
        onStatus?.(STATUS[call.name] ?? "Working…");
        const args: Record<string, unknown> = { ...(call.args ?? {}) };
        const shape = (t.schema as any)?.shape ?? {};
        if ("wallet_address" in shape && !args.wallet_address && context.targetWallet) args.wallet_address = context.targetWallet;
        if ("walletAddress" in shape && !args.walletAddress && context.targetWallet) args.walletAddress = context.targetWallet;
        try {
          content = clip(String(await t.invoke(args)));
          used.push(call.name);
        } catch (e: any) {
          if (e instanceof InsufficientBalanceError || e?.name === "InsufficientBalanceError") throw e;
          content = `Tool error: ${e?.message ?? e}`;
        }
      }
      messages.push(new ToolMessage({ content, tool_call_id: call.id ?? call.name, name: call.name }));
    }
  }
  return { text: "I could not finish that in a few steps. Try asking a narrower question, for example one period or one metric.", toolsUsed: used, source: "openai" };
}
