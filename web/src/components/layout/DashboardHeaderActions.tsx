"use client";

import { Bot } from "lucide-react";
import type { ReactNode } from "react";
import { DashboardRefreshAnalysis } from "@/components/dashboard/DashboardRefreshAnalysis";
import { DashboardReportActions } from "@/components/dashboard/DashboardReportActions";

type DashboardHeaderActionsProps = {
  onChatOpen?: () => void;
  trailing?: ReactNode;
};

export function DashboardHeaderActions({ onChatOpen, trailing }: DashboardHeaderActionsProps) {
  return (
    <div className="hidden min-w-0 flex-1 items-center gap-2 md:flex lg:gap-3">
      <div className="flex min-w-0 flex-1 justify-center px-1 lg:px-2">
        <DashboardRefreshAnalysis />
      </div>

      <div className="flex shrink-0 items-center gap-2 lg:gap-3">
        <DashboardReportActions />
        <button
          type="button"
          onClick={onChatOpen}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-btc-orange/30 bg-btc-orange/10 px-2.5 py-1.5 text-[11px] font-semibold text-btc-orange transition hover:bg-btc-orange/20 lg:px-3"
        >
          <Bot size={13} />
          <span className="hidden lg:inline">AI agent chat</span>
          <span className="lg:hidden">Chat</span>
          <span className="rounded bg-btc-orange px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none text-white">
            New
          </span>
        </button>
        {trailing}
      </div>
    </div>
  );
}
