"use client";

import { AlertTriangle, CheckCircle2, FileBadge2 } from "lucide-react";
import { useState } from "react";
import { AttestationModal } from "@/components/ai/AttestationModal";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useWalletData } from "@/hooks/useWalletData";

export function AISummaryCard() {
  const [reportOpen, setReportOpen] = useState(false);
  const { walletData } = useWalletData();
  if (!walletData) return null;
  const assessment = walletData.onfraAssessment;

  return (
    <>
      <Card compact className="flex h-full flex-col">
        <SectionHeader
          compact
          title="OnFRA Assessment"
          help={{
            meaning: "AI-generated lender assessment powered by OnFRA analysis of your wallet profile.",
            calculation: "Synthesized from transaction patterns, portfolio composition, and scoring signals.",
            lenderRelevance: "Provides a concise, lender-ready narrative and actionable findings."
          }}
        />

        <p className="mt-2 line-clamp-4 text-[11px] leading-4 text-stardust">{assessment.narrative}</p>

        <div className="mt-2 grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-teal">Strengths</p>
            <ul className="space-y-1">
              {assessment.strengths.map((item) => (
                <li key={item} className="flex items-start gap-1 text-[10px] leading-4 text-white">
                  <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-teal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-wide text-btc-orange">Watch items</p>
            <ul className="space-y-1">
              {assessment.watchItems.map((item) => (
                <li key={item} className="flex items-start gap-1 text-[10px] leading-4 text-stardust">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0 text-btc-orange" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setReportOpen(true)}
          className="mt-2 inline-flex items-center gap-1.5 self-start rounded-lg border border-white/10 px-2.5 py-1.5 text-[10px] font-semibold text-white transition hover:border-btc-orange/40 hover:text-btc-orange"
        >
          <FileBadge2 size={12} />
          Download Full AI Report →
        </button>
      </Card>
      {reportOpen && <AttestationModal onClose={() => setReportOpen(false)} />}
    </>
  );
}
