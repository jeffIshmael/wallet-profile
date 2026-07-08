"use client";

import { AnimShell, OUTPUTS, useAnimCycle, usePhases } from "./shared";

export function CoffeePour({ compact }: { compact?: boolean }) {
  const cycle = useAnimCycle();
  const phase = usePhases(cycle, [400, 1500, 2800, 3600, 4400, 5200, 6000, 6800]);

  return (
    <AnimShell compact={compact}>
      <div className={`flex flex-col items-center ${compact ? "p-4" : "p-6"}`}>
        {/* Kettle + dripper */}
        <div className="relative flex items-end gap-4">
          <div
            className={`h-10 w-12 rounded-lg border border-white/15 bg-white/8 transition-transform duration-700 ${
              phase >= 1 ? "rotate-12" : ""
            }`}
          />
          <div className="flex flex-col items-center">
            {phase >= 1 && phase < 4 && (
              <span className="anim-pour-stream mb-1 block h-10 w-1 bg-gradient-to-b from-amber-700/80 to-nude/50" />
            )}
            <div className="h-8 w-10 border-x-8 border-t-[14px] border-x-transparent border-t-nude/20" />
            <div className="h-6 w-8 rounded-b-lg border border-nude/25 bg-black/40" />
          </div>
        </div>

        {/* Cups row */}
        <div className="mt-6 grid w-full grid-cols-3 gap-2 sm:grid-cols-6">
          {OUTPUTS.map((o, i) => (
            <div key={o.short} className="flex flex-col items-center">
              <div className="relative h-10 w-full overflow-hidden rounded-b-xl border border-nude/20 bg-black/30">
                <div
                  className="absolute bottom-0 left-0 right-0 bg-amber-900/50 transition-all duration-700"
                  style={{ height: phase >= 3 + i ? `${40 + i * 8}%` : "0%" }}
                />
              </div>
              <p className="mt-1 text-[8px] text-ink-faint">{o.short}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimShell>
  );
}
