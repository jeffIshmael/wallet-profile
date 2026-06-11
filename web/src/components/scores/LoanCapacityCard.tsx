"use client";

import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useWalletData } from "@/hooks/useWalletData";
import { formatLoanCapacityLabel } from "@/lib/formatLoanCapacity";

export function LoanCapacityCard() {
  const { walletData } = useWalletData();
  if (!walletData) return null;
  const loan = walletData.metrics.loanCapacity;
  const { minLoanUsd, maxLoanUsd, scaleMaxUsd, factors } = loan;
  const displayLabel = formatLoanCapacityLabel(loan);
  const isSingleEstimate = minLoanUsd === maxLoanUsd || maxLoanUsd - minLoanUsd <= Math.max(50, maxLoanUsd * 0.05);
  const left = isSingleEstimate
    ? Math.min((maxLoanUsd / scaleMaxUsd) * 100, 92)
    : (minLoanUsd / scaleMaxUsd) * 100;
  const width = isSingleEstimate ? 8 : ((maxLoanUsd - minLoanUsd) / scaleMaxUsd) * 100;

  return (
    <Card compact className="flex h-full flex-col">
      <SectionHeader
        compact
        title="Loan Capacity"
        help={{
          meaning: "The recommended borrowing range this wallet could reasonably support.",
          calculation:
            "Derived from income consistency, wallet reputation, portfolio risk profile, and liquidity signals.",
          lenderRelevance: "Helps lenders and borrowers align on realistic credit limits before underwriting."
        }}
      />

      <p className="mt-2 font-mono text-xl font-bold text-btc-orange">{displayLabel}</p>

      <div className="mt-3">
        <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute top-0 h-full rounded-full bg-gradient-to-r from-btc-orange/70 to-btc-orange"
            style={{ left: `${left}%`, width: `${width}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[9px] text-stardust">
          <span>${minLoanUsd.toLocaleString()}</span>
          <span>{isSingleEstimate ? "est. capacity" : "recommended range"}</span>
          <span>${maxLoanUsd.toLocaleString()}</span>
        </div>
      </div>

      <p className="mt-auto pt-2 text-[10px] leading-4 text-stardust">
        Based on: Income consistency ({factors.incomeConsistency}%) · Reputation ({factors.reputation}%) · Risk (
        {factors.riskProfile})
      </p>
    </Card>
  );
}
