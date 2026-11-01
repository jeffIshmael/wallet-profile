"use client";

import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { useWalletData } from "@/hooks/useWalletData";
import { coerceAmount, moneyPrecise } from "@/lib/format";

export function WalletOverviewStats() {
  const { walletData } = useWalletData();
  if (!walletData) return null;

  const flow = walletData.cashFlow;
  const period = flow?.periodLabel ?? "6mo";
  const netPositive = coerceAmount(flow?.net) >= 0;

  const stats = [
    {
      label: "Received",
      value: moneyPrecise(flow?.inflows),
      icon: ArrowDownRight,
      tone: "text-teal",
      valueTone: "text-white"
    },
    {
      label: "Sent",
      value: moneyPrecise(flow?.outflows),
      icon: ArrowUpRight,
      tone: "text-btc-orange",
      valueTone: "text-white"
    },
    {
      label: "Net flow",
      value: `${netPositive ? "+" : ""}${moneyPrecise(flow?.net)}`,
      icon: TrendingUp,
      tone: netPositive ? "text-teal" : "text-danger",
      valueTone: netPositive ? "text-teal" : "text-danger"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, tone, valueTone }) => (
        <div key={label} className="rounded-2xl border border-white/10 bg-void-surface p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-stardust">{label}</span>
            <span className={`grid h-7 w-7 place-items-center rounded-lg bg-black/30 ${tone}`}>
              <Icon size={14} />
            </span>
          </div>
          <p className={`mt-2 font-mono text-xl font-bold ${valueTone}`}>{value}</p>
          <p className="mt-0.5 text-[10px] text-stardust">Last {period}</p>
        </div>
      ))}
    </div>
  );
}