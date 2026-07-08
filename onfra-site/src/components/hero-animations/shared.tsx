"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export const WALLET = "0x4821…a3f2";

export const OUTPUTS = [
  { short: "Income", label: "Est. monthly income" },
  { short: "Health", label: "Financial health score" },
  { short: "Score", label: "Reputation score" },
  { short: "Capacity", label: "Est loan capacity" },
  { short: "Txns", label: "Transaction statements" },
  { short: "Report", label: "Official reports" }
] as const;

export const LOOP_MS = 7200;

export function useAnimCycle(loopMs = LOOP_MS) {
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setCycle((c) => c + 1), loopMs);
    return () => window.clearInterval(id);
  }, [loopMs]);
  return cycle;
}

export function usePhases(cycle: number, delays: readonly number[]) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    setPhase(0);
    const timers = delays.map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
    return () => timers.forEach(window.clearTimeout);
  }, [cycle]);
  return phase;
}

type AnimShellProps = {
  children: ReactNode;
  compact?: boolean;
  glowClass?: string;
};

export function AnimShell({ children, compact, glowClass = "preview-glow" }: AnimShellProps) {
  return (
    <div
      className={`relative z-10 w-full overflow-hidden rounded-[1.75rem] border border-white/8 bg-canvas-card ${glowClass} ${
        compact ? "min-h-[240px]" : "mx-auto mt-12 max-w-3xl min-h-[300px]"
      }`}
    >
      {children}
    </div>
  );
}

export function OutputChip({
  label,
  visible,
  delay = 0
}: {
  label: string;
  visible: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`rounded-lg border px-2 py-1.5 text-center transition-all duration-500 ${
        visible
          ? "translate-y-0 border-nude/30 bg-nude/12 opacity-100"
          : "translate-y-2 border-white/5 bg-black/20 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="font-mono text-[9px] text-nude-soft sm:text-[10px]">{label}</p>
    </div>
  );
}
