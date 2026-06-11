"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AGENT_CHAT_NAME,
  PHONE_MOCKUP_SCRIPT,
  type MockupMessage,
  type MockupScriptStep
} from "@/components/chat/chatContent";
import { AGENT_LOGO_PATH } from "@/lib/blockchain/constants";

type PhoneChatMockupProps = {
  id?: string;
  size?: "default" | "lg";
};

type PaymentPhase = "hidden" | "open" | "approving" | "done";

const SIZE_STYLES = {
  default: {
    shell: "max-w-[280px]",
    frame: "rounded-[2.5rem] border-[6px] p-2",
    screen: "rounded-[2rem]",
    notch: "h-1 w-10",
    header: "px-4 py-3",
    avatar: "h-8 w-8",
    avatarPx: 32,
    avatarIcon: 16,
    name: "text-xs",
    status: "text-[10px]",
    chat: "h-[320px]",
    chatScroll: "gap-2 p-3",
    message: "text-[11px] px-3 py-2",
    input: "px-3 py-2.5 text-[10px]"
  },
  lg: {
    shell: "max-w-[320px] sm:max-w-[360px] lg:max-w-[400px]",
    frame: "rounded-[3rem] border-[8px] p-2.5 sm:p-3",
    screen: "rounded-[2.25rem] sm:rounded-[2.5rem]",
    notch: "h-1.5 w-12",
    header: "px-5 py-4",
    avatar: "h-10 w-10 sm:h-11 sm:w-11",
    avatarPx: 44,
    avatarIcon: 20,
    name: "text-sm",
    status: "text-[11px]",
    chat: "h-[380px] sm:h-[420px] lg:h-[460px]",
    chatScroll: "gap-2.5 p-4",
    message: "text-xs sm:text-[13px] px-3.5 py-2.5 leading-5",
    input: "px-4 py-3 text-xs"
  }
} as const;

const STEP_DELAY_MS = 2800;
const PAYMENT_OPEN_MS = 2200;
const PAYMENT_APPROVE_MS = 1400;
const LOOP_PAUSE_MS = 4500;

function isPaymentStep(step: MockupScriptStep): step is Extract<MockupScriptStep, { type: "payment" }> {
  return step.type === "payment";
}

export function PhoneChatMockup({ id, size = "default" }: PhoneChatMockupProps) {
  const s = SIZE_STYLES[size];
  const [logoError, setLogoError] = useState(false);
  const [messages, setMessages] = useState<MockupMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const [paymentPhase, setPaymentPhase] = useState<PaymentPhase>("hidden");
  const [activePayment, setActivePayment] = useState<Extract<MockupScriptStep, { type: "payment" }> | null>(
    null
  );
  const stepRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  function clearTimers() {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  }

  function schedule(fn: () => void, delay: number) {
    const timer = window.setTimeout(fn, delay);
    timersRef.current.push(timer);
  }

  function resetDemo() {
    stepRef.current = 0;
    setMessages([]);
    setTyping(false);
    setPaymentPhase("hidden");
    setActivePayment(null);
  }

  function runStep(index: number) {
    const step = PHONE_MOCKUP_SCRIPT[index];
    if (!step) {
      schedule(() => {
        resetDemo();
        runStep(0);
      }, LOOP_PAUSE_MS);
      return;
    }

    if (step.type === "user") {
      setMessages((current) => [...current, { role: "user", text: step.text }]);
      schedule(() => {
        stepRef.current = index + 1;
        runStep(index + 1);
      }, STEP_DELAY_MS);
      return;
    }

    if (step.type === "ai") {
      setTyping(true);
      schedule(() => {
        setTyping(false);
        setMessages((current) => [...current, { role: "ai", text: step.text }]);
        schedule(() => {
          stepRef.current = index + 1;
          runStep(index + 1);
        }, STEP_DELAY_MS);
      }, 900);
      return;
    }

    if (isPaymentStep(step)) {
      setActivePayment(step);
      setPaymentPhase("open");
      schedule(() => {
        setPaymentPhase("approving");
        schedule(() => {
          setPaymentPhase("done");
          schedule(() => {
            setPaymentPhase("hidden");
            setTyping(true);
            schedule(() => {
              setTyping(false);
              setMessages((current) => [...current, { role: "ai", text: step.answer }]);
              setActivePayment(null);
              schedule(() => {
                stepRef.current = 0;
                resetDemo();
                runStep(0);
              }, LOOP_PAUSE_MS);
            }, 900);
          }, PAYMENT_APPROVE_MS);
        }, PAYMENT_OPEN_MS);
      }, 600);
    }
  }

  useEffect(() => {
    resetDemo();
    schedule(() => runStep(0), 400);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };

    scrollToBottom();
    const raf = requestAnimationFrame(scrollToBottom);
    const timer = window.setTimeout(scrollToBottom, 400);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [messages, typing, paymentPhase]);

  return (
    <div id={id} className={`mx-auto w-full ${s.shell}`}>
      <div
        className={`${s.frame} border-white/15 bg-black shadow-[0_24px_80px_-20px_rgba(247,147,26,0.35)] ${
          size === "lg" ? "shadow-[0_32px_100px_-20px_rgba(247,147,26,0.45)]" : ""
        }`}
      >
        <div className={`overflow-hidden ${s.screen} border border-white/10 bg-void-surface`}>
          <div className="flex items-center justify-center gap-2 border-b border-white/10 bg-black/60 px-4 py-2.5">
            <div className={`${s.notch} rounded-full bg-white/20`} />
          </div>

          <div className={`flex items-center gap-3 border-b border-white/10 ${s.header}`}>
            <div
              className={`relative grid ${s.avatar} shrink-0 place-items-center overflow-hidden rounded-full border border-btc-orange/30 bg-btc-orange/10`}
            >
              {!logoError ? (
                <Image
                  src={AGENT_LOGO_PATH}
                  alt={`${AGENT_CHAT_NAME} logo`}
                  width={s.avatarPx}
                  height={s.avatarPx}
                  className="h-full w-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <Bot size={s.avatarIcon} className="text-btc-orange" />
              )}
            </div>
            <div>
              <p className={`${s.name} font-semibold text-white`}>{AGENT_CHAT_NAME}</p>
              <p className={`${s.status} text-emerald-400`}>Online</p>
            </div>
          </div>

          <div
            className={`relative overflow-hidden bg-gradient-to-b from-black/20 to-black/50 ${s.chat}`}
          >
            <div
              className={`no-scrollbar flex h-full flex-col overflow-y-auto bg-gradient-to-b from-black/20 to-black/50 ${s.chatScroll}`}
            >
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={`${message.role}-${index}-${message.text.slice(0, 12)}`}
                    initial={{ opacity: 0, y: 12, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className={
                      message.role === "user"
                        ? `ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-btc-orange font-medium text-white ${s.message}`
                        : `mr-auto max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-black/50 text-stardust ${s.message}`
                    }
                  >
                    {message.text}
                  </motion.div>
                ))}
              </AnimatePresence>

              {typing && paymentPhase === "hidden" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mr-auto flex items-center gap-1 rounded-2xl border border-white/10 bg-black/50 px-3.5 py-2.5"
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stardust [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stardust [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-stardust [animation-delay:300ms]" />
                </motion.div>
              )}
              <div ref={chatEndRef} className="h-px shrink-0" aria-hidden />
            </div>

            <AnimatePresence>
              {paymentPhase !== "hidden" && activePayment && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-10 flex items-end justify-center bg-black/55 p-3 backdrop-blur-[2px]"
                >
                  <motion.div
                    initial={{ y: 16, scale: 0.96 }}
                    animate={{ y: 0, scale: 1 }}
                    exit={{ y: 12, opacity: 0 }}
                    className="w-full rounded-2xl border border-btc-orange/30 bg-void-surface p-3.5 shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                  >
                    <div className="flex items-start gap-2">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-btc-orange/15">
                        <ShieldCheck size={15} className="text-btc-orange" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-white">External wallet query</p>
                        <p className="mt-0.5 text-[10px] leading-4 text-stardust">
                          Approve a one-time x402 payment to look up another wallet.
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5 rounded-xl border border-white/10 bg-black/40 px-3 py-2.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-stardust">Amount</span>
                        <span className="font-mono font-semibold text-btc-orange">{activePayment.amount}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span className="shrink-0 text-stardust">Wallet</span>
                        <span className="truncate font-mono text-white">{activePayment.walletShort}</span>
                      </div>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded-xl border border-white/10 px-3 py-2 text-[10px] font-medium text-stardust"
                        tabIndex={-1}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className={`flex-1 rounded-xl px-3 py-2 text-[10px] font-semibold text-white transition ${
                          paymentPhase === "approving" || paymentPhase === "done"
                            ? "bg-emerald-500"
                            : "bg-btc-orange"
                        }`}
                        tabIndex={-1}
                      >
                        {paymentPhase === "approving"
                          ? "Approving..."
                          : paymentPhase === "done"
                            ? "Approved ✓"
                            : "Approve payment"}
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className={`border-t border-white/10 ${size === "lg" ? "px-4 py-3" : "px-3 py-2.5"}`}>
            <div className={`rounded-full border border-white/10 bg-black/40 text-stardust ${s.input}`}>
              Ask about your wallet or any address...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
