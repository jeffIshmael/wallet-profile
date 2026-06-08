"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { mockWallet } from "@/data/mockWallet";

const metrics = [
  ["Income Stability", mockWallet.metrics.financialHealth.breakdown.incomeStability],
  ["Savings Discipline", mockWallet.metrics.financialHealth.breakdown.savingsDiscipline],
  ["Portfolio Risk", mockWallet.metrics.financialHealth.breakdown.portfolioRisk],
  ["Spending Discipline", mockWallet.metrics.financialHealth.breakdown.spendingDiscipline],
  ["Wallet Maturity", mockWallet.metrics.financialHealth.breakdown.walletMaturity],
  ["Debt/Risk Signals", mockWallet.metrics.financialHealth.breakdown.debtRiskSignals]
] as const;

export function ScoreBreakdown() {
  const [open, setOpen] = useState(true);

  return (
    <Card>
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex w-full items-center justify-between gap-3 text-left">
        <div>
          <h2 className="font-sora text-lg font-bold">Score Breakdown</h2>
          <p className="mt-1 text-sm text-muted">Six normalized signals weighted into the health index.</p>
        </div>
        <ChevronDown size={18} className={open ? "rotate-180 text-primary transition" : "text-muted transition"} />
      </button>

      {open && (
        <div className="mt-5 space-y-4">
          {metrics.map(([label, value]) => (
            <div key={label}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-[var(--color-text)]">{label}</span>
                <span className="font-bold text-muted">{value}/100</span>
              </div>
              <ProgressBar value={value} tone={value < 40 ? "red" : value < 60 ? "amber" : "blue"} />
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
