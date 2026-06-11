"use client";

import { Bot } from "lucide-react";
import { DashboardRefreshAnalysis } from "@/components/dashboard/DashboardRefreshAnalysis";
import { DashboardReportActions } from "@/components/dashboard/DashboardReportActions";

type DashboardHeaderActionsProps = {
  onChatOpen?: () => void;
};

export function DashboardHeaderActions({ onChatOpen }: DashboardHeaderActionsProps) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 z-10 hidden items-center justify-center md:flex">
        <div className="pointer-events-auto">
          <DashboardRefreshAnalysis />
        </div>
      </div>

      <div className="ml-auto hidden shrink-0 items-center gap-6 md:flex">
        <DashboardReportActions />
        <button
          type="button"
          onClick={onChatOpen}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-btc-orange/30 bg-btc-orange/10 px-3 py-1.5 text-[11px] font-semibold text-btc-orange transition hover:bg-btc-orange/20"
        >
          <Bot size={13} />
          AI agent chat
          <span className="rounded bg-btc-orange px-1.5 py-0.5 text-[8px] font-bold uppercase leading-none text-white">
            New
          </span>
        </button>
      </div>
    </>
  );
}
