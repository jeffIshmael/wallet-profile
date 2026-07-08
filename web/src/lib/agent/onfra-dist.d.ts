declare module "@/lib/agent/onfra-dist/dashboard_bundle.js" {
  export function runDashboardBundle(
    address: string,
    options?: { force?: boolean }
  ): Promise<unknown>;
}

declare module "@/lib/agent/onfra-dist/chat_agent.js" {
  import type { ChatAgentContext, ChatAgentResult, ChatStatusCallback } from "@/lib/agent/chatTypes";

  export function runChatAgent(
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
    options: {
      apiKey?: string;
      context: ChatAgentContext & { cachedDashboard?: unknown | null };
      onStatus?: ChatStatusCallback;
    }
  ): Promise<ChatAgentResult>;
}

declare module "@/lib/agent/onfra-dist/warm_cache.js" {
  export function warmWalletDataCache(address: string, months?: number): Promise<unknown>;
}
