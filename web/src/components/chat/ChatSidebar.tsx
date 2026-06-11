"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { AgentChatHeader } from "@/components/chat/AgentChatHeader";
import { AgentChatPinnedNotice } from "@/components/chat/AgentChatPinnedNotice";
import { AGENT_CHAT_SUGGESTIONS } from "@/components/chat/chatContent";
import { useWalletAuth } from "@/hooks/useWalletAuth";

type ChatMessage = { role: "user" | "ai"; text: string };

export function ChatSidebar({
  overlay = false,
  fullPage = false,
  onClose
}: {
  compact?: boolean;
  overlay?: boolean;
  fullPage?: boolean;
  onClose?: () => void;
}) {
  const { address } = useWalletAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function send(text = input) {
    if (!text.trim() || sending) return;

    const userMessage = text.trim();
    setMessages((current) => [...current, { role: "user", text: userMessage }]);
    setInput("");
    setSending(true);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "ai")
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text
        }));

      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          walletAddress: address,
          history
        })
      });

      const payload = (await response.json()) as { response?: string; error?: string };
      const reply =
        payload.response ??
        payload.error ??
        "Wallet Profile AI could not respond right now. Please try again.";

      setMessages((current) => [...current, { role: "ai", text: reply }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: "ai", text: "Network error while contacting Wallet Profile AI." }
      ]);
    } finally {
      setSending(false);
    }
  }

  const showHeader = fullPage;

  return (
    <div
      className={`flex h-full flex-col ${
        fullPage ? "bg-void" : overlay ? "" : "glass-panel rounded-2xl p-4"
      }`}
    >
      {showHeader && <AgentChatHeader />}

      {!overlay && !fullPage && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-sora text-base font-bold text-white">Wallet Profile AI</h2>
        </div>
      )}

      <div className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto ${fullPage ? "px-4 py-3" : ""}`}>
        <AgentChatPinnedNotice />

        {messages.length === 0 && (
          <p className="text-xs leading-5 text-stardust">
            Ask about your financial health, reputation, loan capacity, or portfolio risk.
          </p>
        )}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "ml-auto max-w-[90%] rounded-lg bg-btc-orange px-3 py-2 text-xs font-medium text-white"
                : "mr-auto max-w-[95%] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs leading-5 text-stardust"
            }
          >
            {message.text}
          </div>
        ))}
      </div>

      <div className={`flex flex-wrap gap-1.5 ${fullPage ? "px-4" : ""}`}>
        {AGENT_CHAT_SUGGESTIONS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => send(prompt)}
            disabled={!address || sending}
            className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-stardust transition hover:border-btc-orange/40 hover:text-white disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        className={`mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-2 ${
          fullPage ? "mx-4 mb-4" : ""
        }`}
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={address ? "Ask OnFRA about your wallet..." : "Connect wallet to chat"}
          disabled={!address || sending}
          className="min-w-0 flex-1 bg-transparent px-1 text-xs text-white outline-none placeholder:text-stardust"
        />
        <button
          type="submit"
          disabled={!address || sending || !input.trim()}
          className="grid h-8 w-8 place-items-center rounded-lg bg-btc-orange text-white transition hover:bg-btc-orange/90 disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      </form>

      {overlay && onClose && (
        <button type="button" onClick={onClose} className="sr-only">
          Close chat
        </button>
      )}
    </div>
  );
}
