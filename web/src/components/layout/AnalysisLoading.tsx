"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  "Fetching onchain transactions",
  "Scoring income stability",
  "Evaluating portfolio risk",
  "Generating AI summary"
];

export function AnalysisLoading({ step }: { step: number }) {
  const progress = Math.min(100, ((step + 1) / STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-void font-inter text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundSize: "50px 50px",
          backgroundImage:
            "linear-gradient(to right, rgba(30,41,59,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.5) 1px, transparent 1px)",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 100%)"
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-btc-orange/10 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6 text-center"
      >
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl border border-btc-orange/40 bg-btc-orange/10 shadow-[0_0_30px_-8px_rgba(247,147,26,0.5)]">
          <Image src="/logo_dark.png" alt="" width={36} height={36} className="rounded-md" aria-hidden />
        </div>

        <h1 className="font-space text-2xl font-bold">Analysing your wallet</h1>
        <p className="mt-2 text-sm text-stardust">Reading Celo activity and building your wallet analysis</p>

        <div className="mt-8 space-y-3 text-left">
          {STEPS.map((label, index) => {
            const active = index <= step;
            const current = index === step;
            return (
              <div
                key={label}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  active
                    ? "border-btc-orange/30 bg-void-surface text-white"
                    : "border-white/10 bg-black/40 text-stardust"
                }`}
              >
                {current ? (
                  <Loader2 className="size-4 shrink-0 animate-spin text-btc-orange" />
                ) : (
                  <span className={`size-2 shrink-0 rounded-full ${active ? "bg-btc-orange" : "bg-white/20"}`} />
                )}
                <span className="font-mono text-xs uppercase tracking-wide">{label}</span>
              </div>
            );
          })}
        </div>

        <Progress value={progress} className="mt-6 h-2" />
        <p className="mt-3 font-mono text-xs text-stardust">{Math.round(progress)}% complete</p>
      </motion.div>
    </div>
  );
}
