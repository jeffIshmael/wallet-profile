"use client";

import { motion } from "framer-motion";
import { MessageSquare, FileText } from "lucide-react";

export function ChatHistoryList() {
  return (
    <div className="flex flex-col gap-4 overflow-y-auto px-1 py-2">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stardust">Today</h3>
        <div className="flex flex-col gap-2">
          <button className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Wallet Analysis</span>
              <span className="text-[10px] text-stardust">2:31 PM</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stardust">
              <MessageSquare size={12} />
              <span>0x4821...A3F2</span>
              <span className="h-1 w-1 rounded-full bg-stardust/40" />
              <span className="text-primary">Financial Score 82</span>
            </div>
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wider text-stardust">Yesterday</h3>
        <div className="flex flex-col gap-2">
          <button className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Monthly Report</span>
              <span className="text-[10px] text-stardust">11:05 AM</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stardust">
              <FileText size={12} />
              <span>Generated PDF</span>
            </div>
          </button>
          
          <button className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Income Estimation</span>
              <span className="text-[10px] text-stardust">9:42 AM</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-stardust">
              <MessageSquare size={12} />
              <span>0x7f23...9B11</span>
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
