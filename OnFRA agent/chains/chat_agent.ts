import { ChatGoogle } from "@langchain/google";
import { computeFinancialHealth } from "../tools/compute_financial_health.js";
import { computeReputationScore } from "../tools/compute_reputation_score.js";
import { riskExposure } from "../tools/risk_exposure.js";
import { incomeStability } from "../tools/income_stability.js";
import { loanCapacity } from "../tools/loan_capacity.js";
import { fullOnchainDataCache } from "../lib/getWalletDetails.js";
import {
  answerFromCachedDashboard,
  classifyQuery,
  INTENT_TOOL,
  type CachedDashboard,
  type QueryIntent
} from "./chat_router.js";

export type ChatAgentContext = {
  callerWallet: string;
  targetWallet: string;
  isOwnWallet: boolean;
  cachedDashboard?: CachedDashboard | null;
};

export type ChatAgentResult = {
  text: string;
  toolsUsed: string[];
  source: "cache" | "tool" | "gemini";
};

export type ChatStatusCallback = (status: string) => void;

const TOOL_STATUS: Record<string, string> = {
  compute_financial_health: "Calculating financial health…",
  compute_reputation_score: "Calculating reputation score…",
  income_stability_analysis: "Calculating income metrics…",
  risk_exposure_breakdown: "Analyzing portfolio risk…",
  loan_capacity_estimator: "Estimating loan capacity…"
};

const TOOL_RUNNERS: Record<
  Exclude<QueryIntent, "general">,
  { tool: { invoke: (input: Record<string, string>) => Promise<string> }; format: (data: Record<string, unknown>, address: string) => string }
> = {
  financial_health: {
    tool: computeFinancialHealth,
    format: (d, address) =>
      `Financial health for ${address} is ${d.financialHealthScore}/100. Weakest areas: income stability ${(d.breakdown as Record<string, number>).incomeStability}, savings ${(d.breakdown as Record<string, number>).savingsDiscipline}, portfolio risk ${(d.breakdown as Record<string, number>).portfolioRisk}.`
  },
  income: {
    tool: incomeStability,
    format: (d, address) =>
      `Average monthly income for ${address} is ~$${Number(d.monthlyIncomeEstimateUsd).toLocaleString()}, classified as "${d.incomeLabel}". Weekly inflow consistency: ${d.weeklyInflowConsistency}%. Average inflow size: $${Number(d.averageInflowSizeUsd).toLocaleString()}.`
  },
  loan_capacity: {
    tool: loanCapacity,
    format: (d, address) =>
      `Safe borrowing range for ${address} is ${d.safeLoanRange} (${d.confidence} confidence).`
  },
  reputation: {
    tool: computeReputationScore,
    format: (d, address) =>
      `Reputation for ${address} is ${d.reputationScore}/100 (${d.trustCategory}). ${d.rationale}`
  },
  risk: {
    tool: riskExposure,
    format: (d, address) => {
      const b = d.breakdown as Record<string, number> | undefined;
      return `Portfolio risk for ${address} is "${d.riskCategory}". Stablecoin ${b?.stablecoinPct ?? "—"}%, volatile ${b?.volatileAssetPct ?? "—"}%, DeFi ${b?.defiExposurePct ?? "—"}%.`;
    }
  }
};

function seedCacheFromDashboard(dashboard: CachedDashboard & { transactions?: unknown[] }) {
  const address = dashboard.walletAddress.toLowerCase();
  const existing = fullOnchainDataCache.get(address) ?? {};
  fullOnchainDataCache.set(address, {
    ...existing,
    walletAddress: address,
    ens: dashboard.ens,
    stablecoinBalance: dashboard.portfolio.stablecoinBalance,
    volatileBalance: dashboard.portfolio.volatileBalance,
    transactions: (dashboard as { transactions?: unknown[] }).transactions ?? existing.transactions ?? []
  });
}

async function runSingleTool(
  intent: Exclude<QueryIntent, "general">,
  walletAddress: string,
  onStatus?: ChatStatusCallback
): Promise<{ text: string; toolsUsed: string[] }> {
  const runner = TOOL_RUNNERS[intent];
  const toolName = INTENT_TOOL[intent];
  onStatus?.(TOOL_STATUS[toolName] ?? "Calculating…");

  const raw = await runner.tool.invoke({ walletAddress });
  const data = JSON.parse(raw) as Record<string, unknown>;
  return {
    text: runner.format(data, walletAddress),
    toolsUsed: [toolName]
  };
}

async function maybePolishWithGemini(
  draft: string,
  userMessage: string,
  apiKey: string | undefined,
  timeoutMs = 12_000
): Promise<string | null> {
  if (!apiKey) return null;

  const model = new ChatGoogle({
    model: "gemini-2.5-flash",
    apiKey,
    temperature: 0.2
  });

  try {
    const result = await Promise.race([
      model.invoke(
        `Rewrite this wallet analysis answer to be concise and friendly. Plain text only — no markdown, no asterisks, no bold. Use one item per line with "• " for bullet lists or "1. " for numbered steps. Keep all numbers exactly as given.\n\nUser question: ${userMessage}\n\nDraft answer:\n${draft}`
      ),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini timeout")), timeoutMs)
      )
    ]);
    const text = String((result as { content?: unknown }).content ?? "").trim();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

export async function runChatAgent(
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  options: {
    apiKey?: string;
    context: ChatAgentContext;
    onStatus?: ChatStatusCallback;
  }
): Promise<ChatAgentResult> {
  const { apiKey, context, onStatus } = options;
  const actualApiKey = apiKey || process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  const lastUserQuery = history.filter((h) => h.role === "user").pop()?.content?.trim() ?? "";
  const intent = classifyQuery(lastUserQuery);
  const target = context.targetWallet.toLowerCase();

  if (context.cachedDashboard) {
    seedCacheFromDashboard(context.cachedDashboard);
  }

  // Own wallet + cached dashboard → instant answer, no RPC or agent loop
  if (context.isOwnWallet && context.cachedDashboard) {
    onStatus?.("Using your cached dashboard…");
    const cachedAnswer = answerFromCachedDashboard(lastUserQuery, intent, context.cachedDashboard);
    if (cachedAnswer) {
      return { text: cachedAnswer, toolsUsed: [], source: "cache" };
    }
    if (context.cachedDashboard.onfraAssessment.narrative) {
      return {
        text: context.cachedDashboard.onfraAssessment.narrative,
        toolsUsed: [],
        source: "cache"
      };
    }
  }

  // Targeted tool only (one RPC pass, no ReAct loop)
  if (intent !== "general") {
    const { text, toolsUsed } = await runSingleTool(intent, target, onStatus);
    const polished = await maybePolishWithGemini(text, lastUserQuery, actualApiKey);
    return {
      text: polished ?? text,
      toolsUsed,
      source: polished ? "gemini" : "tool"
    };
  }

  // General external/uncached — pick financial health as default overview tool
  onStatus?.("Fetching wallet summary…");
  const { text, toolsUsed } = await runSingleTool("financial_health", target, onStatus);
  const polished = await maybePolishWithGemini(text, lastUserQuery, actualApiKey);
  return {
    text: polished ?? text,
    toolsUsed,
    source: polished ? "gemini" : "tool"
  };
}
