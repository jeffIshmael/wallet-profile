"use client";

import { AnimShell, OUTPUTS, useAnimCycle, usePhases, WALLET } from "./shared";

export function Hourglass({ compact }: { compact?: boolean }) {
  const cycle = useAnimCycle();
  const phase = usePhases(cycle, [500, 2000, 3200, 4000, 4800, 5600, 6400, 7000]);

  return (
    <AnimShell compact={compact}>
      <div className={`flex items-center justify-center gap-6 ${compact ? "p-4" : "p-6"}`}>
        {/* Hourglass */}
        <div className="relative flex shrink-0 flex-col items-center">
          {/* Top bulb */}
          <div className="relative h-16 w-20 overflow-hidden rounded-t-[2rem] border border-nude/25 bg-black/30">
            <p className="absolute left-0 right-0 top-2 text-center font-mono text-[7px] text-nude-muted">
              {WALLET}
            </p>
            <div
              className="absolute bottom-0 left-0 right-0 bg-nude/30 transition-all duration-1000"
              style={{ height: phase >= 1 ? `${Math.max(10, 90 - phase * 12)}%` : "90%" }}
            />
          </div>
          {/* Neck */}
          <div className="h-4 w-3 bg-nude/20" />
          {phase >= 2 && phase < 5 && (
            <div className="absolute top-[4.5rem] h-6 w-1 anim-sand-drip bg-nude/50" />
          )}
          {/* Bottom bulb */}
          <div className="relative h-16 w-20 overflow-hidden rounded-b-[2rem] border border-nude/25 bg-black/30">
            {OUTPUTS.map((o, i) => (
              <div
                key={o.short}
                className="absolute left-0 right-0 border-t border-nude/20 bg-nude/10 transition-all duration-500"
                style={{
                  bottom: `${i * 16}%`,
                  height: phase >= 3 + i ? "16%" : "0%",
                  opacity: phase >= 3 + i ? 1 : 0
                }}
              >
                <span className="block text-center text-[6px] text-nude-soft">{o.short}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="hidden min-w-0 flex-1 flex-col gap-1 sm:flex">
          {OUTPUTS.map((o, i) => (
            <p
              key={o.short}
              className={`font-mono text-[9px] transition-opacity duration-500 ${
                phase >= 3 + i ? "text-nude-soft opacity-100" : "text-ink-faint opacity-30"
              }`}
            >
              {o.label}
            </p>
          ))}
        </div>
      </div>
    </AnimShell>
  );
}
