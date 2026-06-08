"use client";

import { Download, Medal, Quote } from "lucide-react";
import { useState } from "react";
import { AttestationModal } from "@/components/ai/AttestationModal";
import { Card } from "@/components/ui/Card";

export function AIAnalysisCard() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card>
        <div className="flex gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-card bg-primary text-white">
            <Quote size={19} />
          </div>
          <div>
            <h2 className="font-sora text-lg font-bold">AI Analysis</h2>
            <p className="mt-2 text-sm italic leading-6 text-muted">
              The wallet is mature and transaction behavior is consistent, but borrowing eligibility is constrained by low recurring inflow and concentrated NFT exposure.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          <button type="button" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-[var(--color-surface-2)]">
            <Download size={16} />
            Download Free PDF Summary
          </button>
          <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">
            <Medal size={16} />
            Get Official Attestation - 0.10 USDT
          </button>
        </div>
      </Card>
      {open && <AttestationModal onClose={() => setOpen(false)} />}
    </>
  );
}
