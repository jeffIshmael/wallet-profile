import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { getWalletDataForChat } from "@/lib/agent/chatCache";
import { getGeminiApiKey } from "@/lib/agent/env";
import type { ChatAgentContext, ChatAgentResult, ChatStatusCallback } from "@/lib/agent/chatTypes";
import { mapBundleToWalletData } from "@/lib/agent/mapWalletData";
import type { WalletData } from "@/types/walletData";

function resolveAgentDist(): string {
  const candidates = [
    path.join(process.cwd(), "..", "OnFRA agent", "dist"),
    path.join(process.cwd(), "OnFRA agent", "dist")
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "chains", "dashboard_bundle.js"))) {
      return candidate;
    }
  }

  throw new Error(
    "OnFRA agent build not found. Run `npm run build:agent` from the web folder."
  );
}

function importExternalModule<T>(absolutePath: string): Promise<T> {
  const moduleUrl = pathToFileURL(absolutePath).href;
  const runtimeImport = new Function(
    "specifier",
    "return import(specifier)"
  ) as (specifier: string) => Promise<T>;
  return runtimeImport(moduleUrl);
}

async function loadAgentModule<T>(relativePath: string): Promise<T> {
  const agentDist = resolveAgentDist();
  const absolutePath = path.join(agentDist, relativePath);
  return importExternalModule<T>(absolutePath);
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
  const { runDashboardBundle } = await loadAgentModule<{
    runDashboardBundle: (
      address: string,
      options?: { force?: boolean }
    ) => Promise<Parameters<typeof mapBundleToWalletData>[0]>;
  }>("chains/dashboard_bundle.js");

  const bundle = await runDashboardBundle(walletAddress, options);
  return mapBundleToWalletData(bundle);
}

export async function runAgentChat(
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  context: ChatAgentContext,
  onStatus?: ChatStatusCallback
): Promise<ChatAgentResult> {
  const { runChatAgent } = await loadAgentModule<{
    runChatAgent: (
      messages: typeof history,
      options: {
        apiKey?: string;
        context: ChatAgentContext & { cachedDashboard?: ReturnType<typeof toCachedDashboard> | null };
        onStatus?: ChatStatusCallback;
      }
    ) => Promise<ChatAgentResult>;
  }>("chains/chat_agent.js");

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
