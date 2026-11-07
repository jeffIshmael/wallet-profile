// FILE: src/lib/agent/onfraServer.ts  (changes: loads the new intel_runner bundle, shares the web app's IPFS code with the agent)
import { getWalletDataForChat } from "@/lib/agent/chatCache";
import { getOpenAIApiKey } from "@/lib/agent/env";
import type { ChatAgentContext, ChatAgentResult, ChatStatusCallback } from "@/lib/agent/chatTypes";
import { mapBundleToWalletData } from "@/lib/agent/mapWalletData";
import type { WalletData } from "@/types/walletData";
import { buildIpfsGatewayUrl, pinReportPdfToIpfs } from "@/lib/ipfs/pinata";

type DashboardBundleModule = {
  runDashboardBundle: (
    address: string,
    options?: { force?: boolean }
  ) => Promise<Parameters<typeof mapBundleToWalletData>[0]>;
};

type ChatAgentModule = {
  setIpfsAdapter?: (adapter: IpfsAdapter | null) => void;
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

type IpfsAdapter = {
  pin: (buf: Buffer, filename: string, mime: string) => Promise<{ cid: string }>;
  gatewayUrl: (cid: string) => string;
};

type IntelRunnerModule = {
  runIntelTool: (name: string, args: unknown) => Promise<Record<string, unknown>>;
  validateIntelInput: (
    name: string,
    args: unknown
  ) => { ok: true } | { ok: false; code: string; message: string; details?: unknown };
  setIpfsAdapter: (adapter: IpfsAdapter | null) => void;
};

/** Reuses the web app's Pinata code so statements land in the same account and gateway as everything else. */
const ipfsAdapter: IpfsAdapter = {
  // pinReportPdfToIpfs was written for PDFs; CSV statements go through the same call (check the content type it sets).
  pin: async (buf, filename) => {
    const pinned = await pinReportPdfToIpfs(buf as never, filename);
    return { cid: pinned.cid };
  },
  gatewayUrl: (cid) => buildIpfsGatewayUrl(cid)
};

// Each bundled entry is a separate copy of the agent code, so each one needs the adapter.
const adapted = new WeakSet<object>();
function applyIpfsAdapter<T extends { setIpfsAdapter?: (a: IpfsAdapter | null) => void }>(mod: T): T {
  if (!adapted.has(mod)) {
    mod.setIpfsAdapter?.(ipfsAdapter);
    adapted.add(mod);
  }
  return mod;
}

async function loadIntelRunnerModule(): Promise<IntelRunnerModule> {
  try {
    const mod = (await import("@/lib/agent/onfra-dist/intel_runner.js")) as IntelRunnerModule;
    return applyIpfsAdapter(mod);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `OnFRA bundled agent not found (${message}). Run \`npm run build:agent\` from the web folder.`
    );
  }
}

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
    return applyIpfsAdapter((await import("@/lib/agent/onfra-dist/chat_agent.js")) as ChatAgentModule);
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
    apiKey: getOpenAIApiKey(),
    context: { ...context, cachedDashboard },
    onStatus
  });
}

/** Checks tool input without running anything, so the API can refuse a bad request before taking payment. */
export async function validateIntelToolInput(name: string, args: unknown) {
  const { validateIntelInput } = await loadIntelRunnerModule();
  return validateIntelInput(name, args);
}

/** Runs one intelligence tool directly (no LLM). Payment is handled by the calling route. */
export async function runIntelTool(name: string, args: unknown): Promise<Record<string, unknown>> {
  const { runIntelTool: run } = await loadIntelRunnerModule();
  return run(name, args);
}
