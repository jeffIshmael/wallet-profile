"use client";

import { FileBadge2 } from "lucide-react";
import { useState } from "react";
import { AttestationModal } from "@/components/ai/AttestationModal";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { mockWallet } from "@/data/mockWallet";

type ReportPeriod = keyof typeof mockWallet.reportPricing;
const periods: ReportPeriod[] = ["3M", "6M", "12M"];
const periodLabels: Record<ReportPeriod, string> = {
  "3M": "3M",
  "6M": "6M",
  "12M": "12M"
};

export function GenerateReportCard() {
  const [period, setPeriod] = useState<ReportPeriod>("3M");
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card compact className="flex h-full flex-col border-btc-orange/20 bg-gradient-to-br from-btc-orange/5 to-transparent">
        <SectionHeader
          compact
          title="Financial Passport"
          subtitle="Lender-ready verified report"
          help={{
            meaning: "An official, verifiable financial report you can share with lenders or partners.",
            calculation: "Combines all Wallet Analyst metrics into a signed attestation document for the selected period.",
            lenderRelevance: "Provides standardized proof of income and creditworthiness for underwriting."
          }}
        />

        <div className="mt-2 flex flex-wrap gap-1.5">
          {periods.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPeriod(item)}
              className={
                period === item
                  ? "rounded-lg border border-btc-orange/40 bg-btc-orange/10 px-2.5 py-1.5 text-left"
                  : "rounded-lg border border-white/10 bg-black/30 px-2.5 py-1.5 text-left hover:border-white/20"
              }
            >
              <p className="text-[11px] font-bold text-white">{periodLabels[item]}</p>
              <p className="text-[10px] font-semibold text-btc-orange">{mockWallet.reportPricing[item]}</p>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-auto inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-btc-orange px-3 py-2 text-xs font-bold text-white transition hover:bg-btc-orange/90"
        >
          <FileBadge2 size={14} />
          Generate Report
        </button>
      </Card>
      {open && <AttestationModal onClose={() => setOpen(false)} />}
    </>
  );
}
