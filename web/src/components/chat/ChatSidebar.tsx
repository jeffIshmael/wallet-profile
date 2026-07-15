"use client";

import { Loader2, Send, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MascotAnimator } from "@/components/chat/MascotAnimator";
import { ChatHistoryList } from "@/components/chat/ChatHistoryList";
import { AgentChatHeader } from "@/components/chat/AgentChatHeader";
import { AgentChatPinnedNotice } from "@/components/chat/AgentChatPinnedNotice";
import { AgentRatingModal } from "@/components/chat/AgentRatingModal";
import { ChatMessageBody } from "@/components/chat/ChatMessageBody";
import { AGENT_CHAT_SUGGESTIONS } from "@/components/chat/chatContent";
import { CHAT_LOADING_STAGES } from "@/lib/agent/chatTypes";
import { isReportRequest, resolveChatQueryTarget } from "@/lib/agent/walletQuery";
import { PRICING } from "@/lib/blockchain/constants";
import { openMiniPayDeposit } from "@/lib/minipay/payments";
import { hasSubmittedFeedback } from "@/lib/blockchain/erc8004Feedback";
import { useSubmitAgentFeedback } from "@/hooks/useSubmitAgentFeedback";
import { usePaidApiFetch } from "@/hooks/usePaidApiFetch";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { copyWithToast } from "@/lib/copyToClipboard";
import { formatMessageTime } from "@/lib/formatMessageTime";
import { formatWalletTxError } from "@/lib/privy/formatWalletTxError";
import { consumeReportProgressStream } from "@/lib/reports/consumeReportStream";
import { formatReportChatReply } from "@/lib/reports/formatReportChatReply";
import { dispatchReportsUpdated } from "@/lib/reports/reportsEvents";
import type { ReportCompletedResult } from "@/types/reportProgress";

type ChatMessage = { role: "user" | "ai"; text: string; isError?: boolean; createdAt?: string; isNew?: boolean };

/** First prompt at 5 messages, then every 10 messages after that. */
const RATING_FIRST_PROMPT_AT = 5;
const RATING_REPEAT_EVERY = 10;

function formatApiError(payload: {
  error?: string;
  code?: string;
  response?: string;
  topUpHint?: string;
  depositUrl?: string;
}): string {
  if (payload.response) return payload.response;
  const parts = [payload.error ?? "Something went wrong."];
  if (payload.topUpHint) parts.push(payload.topUpHint);
  return parts.join(" ");
}

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
  const { address, miniPay } = useWalletAuth();
  const chatFetch = usePaidApiFetch();
  const submitFeedback = useSubmitAgentFeedback(address);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");
  const [ratingOpen, setRatingOpen] = useState(false);
  const [userMessageCount, setUserMessageCount] = useState(0);
  const stageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!address) {
      setMessages([]);
      setSessionId(null);
      setUserMessageCount(0);
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      if (!address) return;
      setLoadingHistory(true);
      try {
        const response = await fetch(
          `/api/agent/chat?walletAddress=${encodeURIComponent(address)}`
        );
        if (!response.ok || cancelled) return;

        const payload = (await response.json()) as {
          sessionId?: string;
          messages?: Array<{ role: "user" | "assistant"; content: string; createdAt?: string }>;
        };

        if (cancelled) return;
        setSessionId(payload.sessionId ?? null);
        const loaded = (payload.messages ?? []).map((message) => ({
          role: message.role === "user" ? ("user" as const) : ("ai" as const),
          text: message.content,
          createdAt: message.createdAt
        }));
        setMessages(loaded);
        setUserMessageCount(loaded.filter((message) => message.role === "user").length);
      } catch {
        if (!cancelled) {
          setMessages([]);
          setSessionId(null);
          setUserMessageCount(0);
        }
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [address]);

  useEffect(() => {
    const container = messagesScrollRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [messages, sending, loadingStatus]);

  function startLoadingStages() {
    let index = 0;
    setLoadingStatus(CHAT_LOADING_STAGES[0]!);
    stageTimerRef.current = setInterval(() => {
      index = Math.min(index + 1, CHAT_LOADING_STAGES.length - 1);
      setLoadingStatus(CHAT_LOADING_STAGES[index]!);
    }, 2200);
  }

  function stopLoadingStages() {
    if (stageTimerRef.current) {
      clearInterval(stageTimerRef.current);
      stageTimerRef.current = null;
    }
    setLoadingStatus(null);
  }

  function cancelRequest() {
    abortRef.current?.abort();
    abortRef.current = null;
    stopLoadingStages();
    setSending(false);
  }

  function maybePromptForRating(nextUserCount: number) {
    if (!address || hasSubmittedFeedback(address)) return;
    if (
      nextUserCount >= RATING_FIRST_PROMPT_AT &&
      (nextUserCount - RATING_FIRST_PROMPT_AT) % RATING_REPEAT_EVERY === 0
    ) {
      setRatingOpen(true);
    }
  }

  function finishUserMessage(reply: string, isError = false) {
    // Mark all existing messages as not new
    setMessages((current) => current.map(m => ({ ...m, isNew: false })));
    setMessages((current) => [
      ...current,
      { role: "ai", text: reply, isError, createdAt: messageTimestamp(), isNew: !isError }
    ]);
    const nextCount = userMessageCount + 1;
    setUserMessageCount(nextCount);
    maybePromptForRating(nextCount);
  }

  function copyMessage(text: string) {
    void copyWithToast(text, "Message copied");
  }

  function messageTimestamp() {
    return new Date().toISOString();
  }

  async function send(text = input) {
    if (!text.trim() || sending || !address) return;

    const userMessage = text.trim();
    const wantsReport = isReportRequest(userMessage);

    const earlyCheck = resolveChatQueryTarget(userMessage, address);
    if (!earlyCheck.ok) {
      setMessages((current) => [
        ...current,
        { role: "user", text: userMessage, createdAt: messageTimestamp() },
        { role: "ai", text: earlyCheck.error, isError: true, createdAt: messageTimestamp() }
      ]);
      setInput("");
      return;
    }

    setMessages((current) => [
      ...current,
      { role: "user", text: userMessage, createdAt: messageTimestamp() }
    ]);
    setInput("");
    setSending(true);

    if (wantsReport) {
      setLoadingStatus(
        miniPay
          ? `Approve ${PRICING.verifiedReportUsdt} USDT transfer in MiniPay…`
          : `Awaiting x402 payment approval (${PRICING.verifiedReportUsdt} USDT)…`
      );
    } else if (earlyCheck.target.isExternal) {
      setLoadingStatus(
        miniPay
          ? `Approve ${PRICING.externalWalletQueryUsdt} USDT transfer in MiniPay…`
          : `Awaiting x402 payment approval (${PRICING.externalWalletQueryUsdt} USDT)…`
      );
    } else {
      startLoadingStages();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (wantsReport) {
        const response = await chatFetch("/api/agent/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: earlyCheck.target.targetWallet,
            buyerAddress: address
          }),
          signal: controller.signal
        });

        let result: ReportCompletedResult | null = null;

        await consumeReportProgressStream(response, (event) => {
          if (event.type === "status") {
            setLoadingStatus(event.message);
          }
          if (event.type === "done") {
            result = event.result;
          }
        });

        if (!result) {
          finishUserMessage("Report completed without a result. Please try again.", true);
          return;
        }

        dispatchReportsUpdated();
        finishUserMessage(formatReportChatReply(result));
        return;
      }

      const history = messages
        .filter((m) => m.role === "user" || m.role === "ai")
        .map((m) => ({
          role: m.role === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text
        }));

      const response = await chatFetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          walletAddress: address,
          history,
          sessionId
        }),
        signal: controller.signal
      });

      const payload = (await response.json()) as {
        response?: string;
        error?: string;
        code?: string;
        topUpHint?: string;
        depositUrl?: string;
        sessionId?: string;
      };

      if (!response.ok) {
        if (payload.code === "INSUFFICIENT_BALANCE" && (payload.depositUrl || miniPay)) {
          finishUserMessage(formatApiError(payload), true);
          if (miniPay) openMiniPayDeposit();
          return;
        }

        const errorText =
          payload.code === "PAYMENT_REQUIRED"
            ? payload.error ??
              (miniPay
                ? `External wallet queries require ${PRICING.externalWalletQueryUsdt} USDT. Approve the transfer in MiniPay and try again.`
                : `External wallet queries require ${PRICING.externalWalletQueryUsdt} USDT via x402. Approve the payment prompt and try again.`)
            : formatApiError(payload);
        finishUserMessage(errorText, true);
        return;
      }

      const reply =
        payload.response ??
        payload.error ??
        "Onfra AI could not respond right now. Please try again.";

      if (payload.sessionId) setSessionId(payload.sessionId);
      finishUserMessage(reply);
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        finishUserMessage("Request cancelled.", true);
        return;
      }
      finishUserMessage(formatWalletTxError(err, { miniPay }), true);
    } finally {
      abortRef.current = null;
      stopLoadingStages();
      setSending(false);
    }
  }

  const showHeader = fullPage;

  return (
    <>
      <div
        className={`flex h-full flex-col ${
          fullPage ? "bg-void" : overlay ? "" : "glass-panel rounded-2xl p-4"
        }`}
      >
        {showHeader && <AgentChatHeader showBack />}

        {!overlay && !fullPage && (
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-sora text-base font-bold text-white">Onfra AI</h2>
          </div>
        )}

        <div className="mb-4 flex gap-1 rounded-full bg-white/5 p-1 border border-white/5 w-fit">
          <button
            onClick={() => setActiveTab("chat")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "chat"
                ? "bg-white text-void shadow-sm"
                : "text-stardust hover:text-white hover:bg-white/10"
            }`}
          >
            Agent Chat
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              activeTab === "history"
                ? "bg-white text-void shadow-sm"
                : "text-stardust hover:text-white hover:bg-white/10"
            }`}
          >
            History
          </button>
        </div>

        {activeTab === "history" ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ChatHistoryList />
          </div>
        ) : (
          <>

        <div
          ref={messagesScrollRef}
          className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto ${fullPage ? "px-4 py-3" : ""}`}
        >
          <AgentChatPinnedNotice />

          {loadingHistory && (
            <div className="mr-auto flex max-w-[95%] items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-stardust">
              <Loader2 size={12} className="animate-spin text-btc-orange" />
              <span>Loading previous messages…</span>
            </div>
          )}

          {messages.length === 0 && !loadingHistory && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center mt-4"
            >
              <MascotAnimator status="idle" size={80} />
              <h3 className="mt-6 font-sora text-lg font-bold text-white">Meet OnFRA Agent</h3>
              <p className="mt-2 text-xs leading-relaxed text-stardust max-w-[250px]">
                Analyze wallets, explain transactions, and estimate loan capacity securely.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={`${message.role}-${index}`}
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`flex w-full flex-col gap-1 ${message.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              {message.role === "ai" && !message.isError && (
                <div className="flex items-center gap-2 px-1 pb-1">
                  <div className="h-5 w-5 overflow-hidden rounded-full border border-white/10 bg-white/5">
                    <img src="/apple-icon.png" alt="OnFRA Agent" className="h-full w-full object-cover" />
                  </div>
                  <span className="text-xs font-semibold text-white">OnFRA Agent</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => copyMessage(message.text)}
                title="Click to copy"
                className={
                  message.role === "user"
                    ? "rounded-[18px] rounded-br-sm bg-white/10 border border-white/5 px-4 py-2.5 text-left text-[13px] font-medium text-white break-words [overflow-wrap:anywhere] shadow-sm transition hover:bg-white/15"
                    : message.isError
                      ? "rounded-[18px] border border-danger/30 bg-danger/10 px-4 py-2.5 text-left text-[13px] leading-relaxed text-danger break-words [overflow-wrap:anywhere]"
                      : "px-1 py-1 text-left text-[13px] leading-relaxed text-stardust break-words [overflow-wrap:anywhere] transition cursor-text selection:bg-primary/30"
                }
              >
                {message.role === "user" || message.isError ? (
                  message.text
                ) : (
                  <ChatMessageBody text={message.text} simulateStreaming={message.isNew} />
                )}
              </button>
              {message.createdAt && (
                <time
                  dateTime={message.createdAt}
                  className="px-2 text-[10px] text-stardust/50 font-medium"
                >
                  {formatMessageTime(message.createdAt)}
                </time>
              )}
            </motion.div>
          ))}

          {sending && loadingStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mr-auto flex max-w-[90%] items-center gap-3 px-1 py-1"
            >
              <MascotAnimator status="thinking" size={24} />
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-white text-xs">OnFRA Agent</span>
                <span className="text-stardust text-[10px] flex items-center gap-1.5 font-medium">
                  <span className="animate-pulse text-primary">●</span> {loadingStatus}
                </span>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {messages.length === 0 && (
          <div className={`flex flex-wrap gap-1.5 ${fullPage ? "px-4" : ""}`}>
            {AGENT_CHAT_SUGGESTIONS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                disabled={!address || sending}
                className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-stardust shadow-sm transition hover:border-primary/40 hover:text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form
          className={`mt-3 flex items-center gap-2 rounded-[24px] border p-1.5 ${
            fullPage
              ? "mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] border-white/20 bg-void-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              : "border-white/10 bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-md"
          }`}
          onSubmit={(event) => {
            event.preventDefault();
            if (sending) {
              cancelRequest();
              return;
            }
            void send();
          }}
        >
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={address ? "Ask OnFRA about your wallet..." : "Connect wallet to chat"}
            disabled={!address || sending}
            className={`min-w-0 flex-1 text-[13px] text-white outline-none placeholder:text-stardust/60 px-3 ${
              fullPage
                ? "rounded-full border border-white/10 bg-white/[0.06] py-2.5"
                : "bg-transparent py-2"
            }`}
          />
          {sending ? (
            <button
              type="submit"
              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-stardust transition hover:border-danger/40 hover:bg-danger/10 hover:text-danger"
              aria-label="Stop request"
            >
              <Square size={14} fill="currentColor" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!address || !input.trim()}
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-void transition hover:bg-primary/90 disabled:opacity-50 shadow-[0_0_12px_rgba(184,176,200,0.3)] hover:shadow-[0_0_16px_rgba(184,176,200,0.5)] disabled:shadow-none"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          )}
        </form>

          </>
        )}
        
        {overlay && onClose && (
          <button type="button" onClick={onClose} className="sr-only">
            Close chat
          </button>
        )}
      </div>

      <AgentRatingModal
        open={ratingOpen}
        onClose={() => setRatingOpen(false)}
        onSubmit={submitFeedback}
      />
    </>
  );
}
