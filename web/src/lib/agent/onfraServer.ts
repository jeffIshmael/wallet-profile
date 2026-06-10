import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
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

/** Webpack rewrites static/dynamic imports — use a runtime import for external ESM agent code. */
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

export async function runDashboardAnalysis(walletAddress: string): Promise<WalletData> {
  const { runDashboardBundle } = await loadAgentModule<{
    runDashboardBundle: (address: string) => Promise<Parameters<typeof mapBundleToWalletData>[0]>;
  }>("chains/dashboard_bundle.js");

  const bundle = await runDashboardBundle(walletAddress);
  return mapBundleToWalletData(bundle);
}

export async function runAgentChat(
  history: Array<{ role: "user" | "assistant" | "system"; content: string }>
): Promise<string> {
  const { runChatAgent } = await loadAgentModule<{
    runChatAgent: (messages: typeof history) => Promise<string>;
  }>("chains/chat_agent.js");

  return runChatAgent(history);
}
