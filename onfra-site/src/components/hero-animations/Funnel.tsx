"use client";

import { AnimShell, OUTPUTS, useAnimCycle, usePhases, WALLET } from "./shared";

export function Funnel({ compact }: { compact?: boolean }) {
  const cycle = useAnimCycle();
  const phase = usePhases(cycle, [300, 1200, 2000, 2800, 3600, 4400, 5200, 6000]);

  return (
    <AnimShell compact={compact}>
      <div className={`flex flex-col items-center ${compact ? "px-4 py-5" : "px-6 py-6"}`}>
        {/* Bucket pour */}
        <div className="relative h-10 w-20">
          <div
            className={`absolute left-1/2 top-0 h-8 w-14 -translate-x-1/2 rounded-t-lg border border-white/15 bg-white/10 transition-transform duration-700 ${
              phase >= 1 ? "rotate-[-28deg]" : ""
            }`}
          />
          {phase >= 1 && phase < 3 && (
            <div className="absolute left-1/2 top-6 -translate-x-1/2">
              <span className="anim-pour-stream block h-12 w-0.5 bg-gradient-to-b from-nude-soft to-nude/40" />
              <span className="mt-1 block font-mono text-[8px] text-nude-muted">{WALLET}</span>
            </div>
          )}
        </div>

        {/* Funnel */}
        <div
          className={`relative mt-2 h-0 w-0 border-l-[28px] border-r-[28px] border-t-[36px] border-l-transparent border-r-transparent border-t-nude/25 transition-all duration-500 ${
            phase >= 2 ? "opacity-100" : "opacity-40"
          }`}
        >
          <div className="absolute -top-8 left-1/2 h-8 w-12 -translate-x-1/2 border border-white/10 bg-black/40" />
        </div>

        {/* Jars */}
        <div className="mt-4 grid w-full grid-cols-3 gap-2 sm:grid-cols-6">
          {OUTPUTS.map((o, i) => (
            <div key={o.short} className="flex flex-col items-center">
              <div className="relative h-14 w-full overflow-hidden rounded-b-lg border border-nude/20 bg-black/30">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-nude/35 transition-all duration-700"
                  style={{ height: phase >= 3 + i ? `${55 + i * 5}%` : "0%" }}
                />
              </div>
              <p className="mt-1 text-center text-[8px] text-ink-faint">{o.short}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimShell>
  );
}
