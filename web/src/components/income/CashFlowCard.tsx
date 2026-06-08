"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { mockWallet } from "@/data/mockWallet";
import { moneyPrecise } from "@/lib/format";

export function CashFlowCard() {
  const flow = mockWallet.cashFlow;
  const maxBar = Math.max(...flow.monthly.map((m) => Math.max(m.in, m.out)));

  return (
    <Card compact className="flex h-full flex-col">
      <SectionHeader
        compact
        title="Cash Flow"
        help={{
          meaning: "Net stablecoin movement showing income versus spending over time.",
          calculation: "Aggregated inflows and outflows from indexed Celo transfer events.",
          lenderRelevance: "Positive net cash flow signals repayment capacity and financial surplus."
        }}
      />

      <div className="mt-2 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-stardust">
            <ArrowUpRight size={12} className="text-teal" />
            Inflows
          </span>
          <span className="font-mono font-semibold text-white">
            {moneyPrecise(flow.inflows)} / {flow.periodLabel}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px]">
          <span className="flex items-center gap-1 text-stardust">
            <ArrowDownRight size={12} className="text-danger" />
            Outflows
          </span>
          <span className="font-mono font-semibold text-white">
            {moneyPrecise(flow.outflows)} / {flow.periodLabel}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-white/10 pt-1.5 text-[11px]">
          <span className="text-stardust">Net</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-teal">+{moneyPrecise(flow.net)}</span>
            <StatusBadge tone="green">Surplus</StatusBadge>
          </div>
        </div>
      </div>

      <div className="mt-auto flex items-end justify-between gap-1 pt-2">
        {flow.monthly.map(({ month, in: inflow, out: outflow }) => (
          <div key={month} className="flex flex-1 flex-col items-center gap-0.5">
            <div className="flex h-12 w-full items-end justify-center gap-0.5">
              <div
                className="w-[40%] rounded-t bg-teal/80"
                style={{ height: `${(inflow / maxBar) * 100}%`, minHeight: inflow > 0 ? 4 : 0 }}
                title={`In: $${inflow}`}
              />
              <div
                className="w-[40%] rounded-t bg-danger/70"
                style={{ height: `${(outflow / maxBar) * 100}%`, minHeight: outflow > 0 ? 4 : 0 }}
                title={`Out: $${outflow}`}
              />
            </div>
            <span className="text-[8px] text-stardust">{month}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
