"use client";

import { ArrowRight } from "lucide-react";
import {
  AGENT_CHAT_CAPABILITIES_CLAUDE,
  AGENT_CHAT_PRICING
} from "@/components/chat/chatContent";
import { PhoneChatMockup } from "@/components/chat/PhoneChatMockup";

type AgentChatPreviewClaudeProps = {
  authenticated: boolean;
  onAskAgent: () => void;
  onSignIn: () => void;
  connecting?: boolean;
};

export function AgentChatPreviewClaude({
  authenticated,
  onAskAgent,
  onSignIn,
  connecting = false
}: AgentChatPreviewClaudeProps) {
  function scrollToDemo() {
    document.getElementById("agent-chat-phone")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section className="relative overflow-hidden bg-void px-6 py-20 md:py-32">
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-btc-orange/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-teal/5 blur-[120px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-btc-orange/25 bg-btc-orange/10 px-3 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-btc-orange" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">Agent Chat</span>
          </div>

          <h1 className="mt-3 font-space text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
            Your wallet, <span className="text-btc-orange">explained</span>
            <br />
            in plain language.
          </h1>

          <p className="mt-4 max-w-md text-sm leading-7 text-stardust md:text-base">
            Ask anything about your financial health, loan limits, or any wallet onchain in plain language. Your own wallet is free to query —
            checking external wallets takes a 0.01 USDT micropayment.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            {AGENT_CHAT_CAPABILITIES_CLAUDE.map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-btc-orange/20"
              >
                <span className="mt-0.5 text-lg leading-none">{icon}</span>
                <p className="text-xs leading-5 text-stardust">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-0">
            <p className="mb-2 font-mono text-[9px] uppercase tracking-widest text-stardust/50">Pricing</p>
            <div className="overflow-hidden rounded-xl border border-white/10">
              {AGENT_CHAT_PRICING.map(({ action, price, highlight }, i) => (
                <div
                  key={action}
                  className={`flex items-center justify-between px-4 py-2.5 text-xs ${
                    i !== AGENT_CHAT_PRICING.length - 1 ? "border-b border-white/10" : ""
                  } ${highlight ? "bg-btc-orange/10" : "bg-white/[0.02]"}`}
                >
                  <span className="text-stardust">{action}</span>
                  <span className={`font-mono font-semibold ${highlight ? "text-btc-orange" : "text-white"}`}>
                    {price}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {authenticated ? (
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={onAskAgent}
                disabled={connecting}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-btc-orange px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-white shadow-[0_0_24px_-4px_rgba(247,147,26,0.5)] transition hover:scale-105 hover:bg-btc-orange/90 hover:shadow-[0_0_32px_-4px_rgba(247,147,26,0.65)] disabled:cursor-wait disabled:opacity-70"
              >
                {connecting ? "Connecting..." : "Ask OnFRA"}
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onSignIn}
                disabled={connecting}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-btc-orange px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-white shadow-[0_0_24px_-4px_rgba(247,147,26,0.5)] transition hover:scale-105 hover:bg-btc-orange/90 disabled:cursor-wait disabled:opacity-70"
              >
                {connecting ? "Connecting..." : "Get Started"}
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={scrollToDemo}
                className="inline-flex min-h-[44px] items-center justify-center font-mono text-xs uppercase tracking-wider text-stardust transition hover:text-white"
              >
                Try a demo query →
              </button>
            </div>
          )}
        </div>

        <div className="relative order-1 flex flex-col items-center gap-4 lg:order-2">
          <div className="self-end mr-4 lg:absolute lg:-top-4 lg:right-0 lg:mr-0">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 shadow-lg backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-btc-orange" />
              <span className="font-mono text-[10px] text-stardust">92 wallets analysed today</span>
            </div>
          </div>

          <div className="relative w-full flex justify-center">
            <div className="absolute inset-0 -z-10 scale-95 rounded-[48px] bg-btc-orange/10 blur-3xl" />
            <PhoneChatMockup id="agent-chat-phone" size="lg" />
          </div>

          <div className="self-start ml-4 lg:absolute lg:-bottom-4 lg:left-0 lg:ml-0">
            <div className="flex items-center gap-2 rounded-full border border-btc-orange/20 bg-btc-orange/10 px-3 py-1.5 shadow-lg backdrop-blur-sm">
              <span className="font-mono text-[10px] text-btc-orange">✓ Your wallet · free to ask</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
