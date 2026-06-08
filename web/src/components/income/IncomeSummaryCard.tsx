"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Card } from "@/components/ui/Card";
import { TokenFlowTable } from "@/components/income/TokenFlowTable";
import { mockWallet } from "@/data/mockWallet";

type Period = keyof typeof mockWallet.incomeByPeriod;
const periods = Object.keys(mockWallet.incomeByPeriod) as Period[];

export function IncomeSummaryCard() {
  const [period, setPeriod] = useState<Period>("1M");
  const current = mockWallet.incomeByPeriod[period];

  return (
    <Card className="xl:sticky xl:top-20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-sora text-lg font-bold">Income Summary</h2>
          <p className="mt-1 text-sm text-muted">Stablecoin flow by period.</p>
        </div>
        <StatusBadge tone="amber">{mockWallet.metrics.incomeProfile.label}</StatusBadge>
      </div>

      <div className="mt-4 grid grid-cols-4 rounded-full border border-border bg-surface-2 p-1">
        {periods.map((item) => (
          <button key={item} type="button" onClick={() => setPeriod(item)} className={item === period ? "rounded-full bg-primary px-2 py-1.5 text-xs font-bold text-white" : "px-2 py-1.5 text-xs font-bold text-muted"}>
            {item}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 grid grid-cols-3 gap-2">
          {[
            ["Inbound", current.inbound],
            ["Outbound", current.outbound],
            ["Net", current.net]
          ].map(([label, value]) => (
            <div key={label} className="rounded-card border border-border bg-surface-2 p-3">
              <p className="text-xs font-bold uppercase text-muted">{label}</p>
              <p className="mt-2 font-sora text-lg font-extrabold">${Number(value).toFixed(2)}</p>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-5">
        <TokenFlowTable />
      </div>
    </Card>
  );
}
