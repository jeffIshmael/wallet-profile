"use client";

import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useWalletData } from "@/hooks/useWalletData";
import { coerceAmount, moneyPrecise } from "@/lib/format";

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 30;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[30px] w-[80px]" aria-hidden>
      <polyline fill="none" stroke="#00d4aa" strokeWidth="2" points={points} />
    </svg>
  );
}

export function AverageMonthlyIncomeCard() {
  const { walletData } = useWalletData();
  if (!walletData) return null;
  const amount = coerceAmount(walletData.metrics.incomeProfile.averageInflowUsd);
  const stats = walletData.monthlyIncomeStats;
  const history = walletData.monthlyIncomeHistory.map((value) => coerceAmount(value));
  const changePositive = coerceAmount(stats?.changePct) >= 0;

  return (
    <Card compact className="flex h-full flex-col">
      <SectionHeader
        compact
        title="Avg Monthly Income"
        help={{
          meaning: "Your typical monthly stablecoin inflow over the selected analysis period.",
          calculation: "Total verified inflows divided by the number of months in the selected timeframe.",
          lenderRelevance: "Monthly income is a primary input for debt-to-income ratios and loan sizing."
        }}
      />

      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="font-mono text-2xl font-bold text-white">{moneyPrecise(amount)}</p>
          <span
            className={`mt-1 inline-block text-[10px] font-semibold ${changePositive ? "text-teal" : "text-danger"}`}
          >
            {changePositive ? "+" : ""}
            {coerceAmount(stats?.changePct)}% vs last month
          </span>
        </div>
        <Sparkline values={history} />
      </div>

      <p className="mt-auto pt-2 text-[10px] text-stardust">
        Highest: {moneyPrecise(stats?.highest)} · Lowest: {moneyPrecise(stats?.lowest)}
      </p>
    </Card>
  );
}
