"use client";

import { Send, Sparkles } from "lucide-react";
import { useState } from "react";

const suggested = [
  "Qualify for a $2,000 loan?",
  "Why is reputation low?",
  "Explain portfolio risk",
  "Improve loan capacity",
  "Summarize for lender"
];

export function ChatSidebar({
  overlay = false,
  onClose
}: {
  compact?: boolean;
  overlay?: boolean;
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Ask me about your Wallet Profile signals, loan capacity, or portfolio risk."
    }
  ]);
  const [input, setInput] = useState("");
  const [pendingExternal, setPendingExternal] = useState(false);

  function isExternalWalletQuery(text: string) {
    return /analyze wallet\s+0x[a-fA-F0-9]+/i.test(text);
  }

  function send(text = input) {
    if (!text.trim()) return;

    if (isExternalWalletQuery(text) && !pendingExternal) {
      setMessages((current) => [
        ...current,
        { role: "user", text },
        {
          role: "ai",
          text: "External Wallet Analysis requires 0.01 USDT via X402 before analysis begins."
        }
      ]);
      setPendingExternal(true);
      setInput("");
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text },
      {
        role: "ai",
        text: "Wallet Profile agent responses can be billed via X402 in MiniPay before analysis runs."
      }
    ]);
    setInput("");
    setPendingExternal(false);
  }

  return (
    <div className={`flex h-full flex-col ${overlay ? "" : "glass-panel rounded-2xl p-4"}`}>
      {!overlay && (
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-sora text-base font-bold text-white">Wallet Profile AI</h2>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1">
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

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggested.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => send(prompt)}
            className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-semibold text-stardust hover:border-btc-orange/40 hover:text-btc-orange"
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        className="mt-2.5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 p-1.5"
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
      >
        <Sparkles size={14} className="ml-1.5 shrink-0 text-btc-orange" />
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about this wallet..."
          className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-stardust/70"
        />
        <button
          type="submit"
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-btc-orange text-white hover:bg-btc-orange/90"
          aria-label="Send chat message"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
