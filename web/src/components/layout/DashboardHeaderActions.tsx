"use client";

import { Bot } from "lucide-react";
import { DashboardReportActions } from "@/components/dashboard/DashboardReportActions";

type DashboardHeaderActionsProps = {
  onChatOpen?: () => void;
};

export function DashboardHeaderActions({ onChatOpen }: DashboardHeaderActionsProps) {
  return (
    <div className="hidden items-center gap-1.5 border-r border-white/10 pr-3 md:flex">
      <DashboardReportActions />
      <button
        type="button"
        onClick={onChatOpen}
        className="inline-flex items-center gap-1 rounded-lg border border-btc-orange/30 bg-btc-orange/10 px-2.5 py-1.5 text-[11px] font-semibold text-btc-orange transition hover:bg-btc-orange/20"
      >
        <Bot size={13} />
        AI agent chat
      </button>
    </div>
  );
}
