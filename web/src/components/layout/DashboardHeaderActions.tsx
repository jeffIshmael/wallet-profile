"use client";

import Link from "next/link";
import { FileBadge2, FileText, Sparkles, Bot } from "lucide-react";
import { useState } from "react";
import { AttestationModal } from "@/components/ai/AttestationModal";

type DashboardHeaderActionsProps = {
  onChatOpen?: () => void;
};

export function DashboardHeaderActions({ onChatOpen }: DashboardHeaderActionsProps) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <div className="hidden items-center gap-1.5 border-r border-white/10 pr-3 md:flex">
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg bg-btc-orange px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-btc-orange/90"
        >
          <FileBadge2 size={13} />
          Get Full Report
          <span className="rounded bg-black/20 px-1 py-0.5 text-[9px]">0.10 USDT</span>
        </button>
        <Link
          href="/#passport-preview"
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-semibold text-stardust transition hover:border-btc-orange/40 hover:text-white"
        >
          <FileText size={13} />
          Sample Report
        </Link>
        <button
          type="button"
          onClick={onChatOpen}
          className="inline-flex items-center gap-1 rounded-lg border border-btc-orange/30 bg-btc-orange/10 px-2.5 py-1.5 text-[11px] font-semibold text-btc-orange transition hover:bg-btc-orange/20"
        >
          <Bot size={13} />
          AI agent chat
        </button>
      </div>
      {reportOpen && <AttestationModal onClose={() => setReportOpen(false)} />}
    </>
  );
}
