import { getWalletDataForChat } from "@/lib/agent/chatCache";
import { getGeminiApiKey } from "@/lib/agent/env";
import type { ChatAgentContext, ChatAgentResult, ChatStatusCallback } from "@/lib/agent/chatTypes";
import { mapBundleToWalletData } from "@/lib/agent/mapWalletData";
import type { WalletData } from "@/types/walletData";

type DashboardBundleModule = {
  runDashboardBundle: (
    address: string,
    options?: { force?: boolean }
  ) => Promise<Parameters<typeof mapBundleToWalletData>[0]>;
};

type ChatAgentModule = {
  runChatAgent: (
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    options: {
      apiKey?: string;
      context: ChatAgentContext & {
        cachedDashboard?: ReturnType<typeof toCachedDashboard> | null;
      };
      onStatus?: ChatStatusCallback;
    }
  ) => Promise<ChatAgentResult>;
};

async function loadDashboardBundleModule(): Promise<DashboardBundleModule> {
  try {
    return (await import("@/lib/agent/onfra-dist/dashboard_bundle.js")) as DashboardBundleModule;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `OnFRA bundled agent not found (${message}). Run \`npm run build:agent\` from the web folder.`
    );
  }
}

async function loadChatAgentModule(): Promise<ChatAgentModule> {
  try {
    return (await import("@/lib/agent/onfra-dist/chat_agent.js")) as ChatAgentModule;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `OnFRA bundled agent not found (${message}). Run \`npm run build:agent\` from the web folder.`
    );
  }
}

function toCachedDashboard(data: WalletData) {
  return {
    walletAddress: data.walletAddress,
    ens: data.ens,
    metrics: data.metrics,
    onfraAssessment: data.onfraAssessment,
    portfolio: data.portfolio,
    transactions: data.transactions.map((tx) => ({
      token: tx.token,
      amount: tx.amount,
      direction: tx.direction
    }))
  };
}

export async function runDashboardAnalysis(
  walletAddress: string,
  options?: { force?: boolean }
): Promise<WalletData> {
  const { runDashboardBundle } = await loadDashboardBundleModule();
  const bundle = await runDashboardBundle(walletAddress, options);
  return mapBundleToWalletData(bundle);
}

export async function runAgentChat(
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  context: ChatAgentContext,
  onStatus?: ChatStatusCallback
): Promise<ChatAgentResult> {
  const { runChatAgent } = await loadChatAgentModule();

  onStatus?.("Validating query…");

  let cachedDashboard = null;
  if (context.isOwnWallet) {
    const cached = await getWalletDataForChat(context.targetWallet);
    if (cached) {
      cachedDashboard = toCachedDashboard(cached.walletData);
      onStatus?.(cached.stale ? "Using saved dashboard (may be slightly outdated)…" : "Using your cached dashboard…");
    }
  }

  return runChatAgent(history, {
    apiKey: getGeminiApiKey(),
    context: { ...context, cachedDashboard },
    onStatus
  });
}
