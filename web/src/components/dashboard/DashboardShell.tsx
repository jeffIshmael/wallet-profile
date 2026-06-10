"use client";

import { clsx } from "clsx";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { type ReactNode } from "react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { Header } from "@/components/layout/Header";
import { useWalletAuth } from "@/hooks/useWalletAuth";

type DashboardShellProps = {
  children: ReactNode;
  chatOpen?: boolean;
  onChatOpenChange?: (open: boolean) => void;
  scrollable?: boolean;
  hideChatFab?: boolean;
};

export function DashboardShell({
  children,
  chatOpen = false,
  onChatOpenChange,
  scrollable = false,
  hideChatFab = false
}: DashboardShellProps) {
  const { ready, authenticated } = useWalletAuth();
  const mobileNavVisible = ready && authenticated;

  return (
    <main
      className={clsx(
        "dashboard-shell relative overflow-hidden bg-void font-inter text-white",
        mobileNavVisible
          ? "h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom,0px))] md:h-screen"
          : "h-screen"
      )}
    >
      <div
        className="dashboard-grid pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundSize: "40px 40px",
          backgroundImage:
            "linear-gradient(to right, rgba(30,41,59,0.4) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.4) 1px, transparent 1px)"
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <Header
          compact
          dashboardActions={{ onChatOpen: () => onChatOpenChange?.(true) }}
        />

        <div className="flex min-h-0 flex-1">
          <aside className="dashboard-sidebar hidden h-full w-14 shrink-0 flex-col items-center overflow-visible border-r border-white/10 bg-black/40 py-3 lg:flex">
            <DashboardNav />
          </aside>

          <div
            className={`min-w-0 flex-1 px-3 py-3 sm:px-4 ${scrollable ? "overflow-y-auto" : "overflow-hidden"}`}
          >
            {children}
          </div>
        </div>

        {!chatOpen && !hideChatFab && (
          <button
            type="button"
            onClick={() => onChatOpenChange?.(true)}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-btc-orange/30 bg-void-surface px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_24px_-4px_rgba(247,147,26,0.4)] transition hover:border-btc-orange/60 hover:bg-btc-orange/10"
            aria-label="Open AI chat"
          >
            <Sparkles size={16} className="text-btc-orange" />
            <span className="hidden sm:inline">Wallet Profile AI</span>
            <MessageCircle size={16} className="text-btc-orange sm:hidden" />
          </button>
        )}

        {chatOpen && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:bg-black/20"
              onClick={() => onChatOpenChange?.(false)}
              aria-label="Close chat overlay"
            />
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] flex-col border-l border-white/10 bg-void-surface shadow-[-8px_0_32px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-btc-orange" />
                  <span className="font-sora text-sm font-bold">Wallet Profile AI</span>
                </div>
                <button
                  type="button"
                  onClick={() => onChatOpenChange?.(false)}
                  className="grid h-8 w-8 place-items-center rounded-lg text-stardust hover:bg-white/5 hover:text-white"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-hidden p-3">
                <ChatSidebar overlay onClose={() => onChatOpenChange?.(false)} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
