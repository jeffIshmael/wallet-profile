"use client";

import { Download, FileBadge2, FileText } from "lucide-react";
import { useState } from "react";
import { AttestationModal } from "@/components/ai/AttestationModal";
import { exportSampleOfficialReportPdf } from "@/lib/reports/exportOfficialReportPdf";
import { clsx } from "clsx";

type DashboardReportActionsProps = {
  className?: string;
  variant?: "header" | "mobile";
};

export function DashboardReportActions({ className, variant = "header" }: DashboardReportActionsProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const isMobile = variant === "mobile";

  return (
    <>
      <div className={clsx("flex items-stretch", isMobile ? "w-full gap-3" : "gap-1.5", className)}>
        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className={clsx(
            "report-btn-primary inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-btc-orange font-bold text-white transition hover:bg-btc-orange/90",
            isMobile ? "min-w-0 flex-1 gap-1.5 px-2.5 text-[11px]" : "gap-1 px-2 text-[10px] md:gap-1.5 md:px-2.5 md:text-[11px]"
          )}
        >
          {!isMobile && <FileBadge2 size={13} className="hidden shrink-0 lg:block" />}
          <span>Get Full Report</span>
          <span className="report-price-badge shrink-0 rounded bg-black/20 px-1 py-0.5 text-[9px] font-bold">0.10 USDT</span>
          {!isMobile && <Download size={13} className="hidden shrink-0 opacity-90 lg:block" />}
        </button>
        <button
          type="button"
          onClick={() => void exportSampleOfficialReportPdf()}
          className={clsx(
            "report-btn-secondary inline-flex h-10 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-lg border border-white/10 font-semibold text-stardust transition hover:border-btc-orange/40 hover:text-white",
            isMobile ? "min-w-0 flex-1 gap-1.5 px-2.5 text-[11px]" : "px-2 text-[10px] md:gap-1.5 md:px-2.5 md:text-[11px]"
          )}
        >
          <FileText size={13} className="shrink-0" />
          <span className="hidden md:inline">Sample Report</span>
          <span className="md:hidden">Sample</span>
          <Download size={13} className="hidden shrink-0 opacity-70 lg:block" />
        </button>
      </div>
      {reportOpen && <AttestationModal onClose={() => setReportOpen(false)} />}
    </>
  );
}
