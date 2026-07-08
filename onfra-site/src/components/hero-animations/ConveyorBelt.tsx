"use client";

import { AnimShell, OUTPUTS, useAnimCycle, usePhases, WALLET } from "./shared";

export function ConveyorBelt({ compact }: { compact?: boolean }) {
  const cycle = useAnimCycle();
  const phase = usePhases(cycle, [400, 1800, 2800, 3400, 4000, 4600, 5200, 5800]);

  return (
    <AnimShell compact={compact}>
      <div className={`flex flex-col ${compact ? "p-4" : "p-6"}`}>
        <p className="mb-4 text-center text-[10px] uppercase tracking-widest text-ink-faint">
          Conveyor · sort · deliver
        </p>
        <div className="relative flex items-center gap-2 sm:gap-4">
          {/* Left belt */}
          <div className="relative h-16 flex-1 overflow-hidden rounded-lg border border-white/8 bg-black/50">
            <div className="absolute inset-0 opacity-30 hero-belt-texture" />
            <div
              className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-nude/40 bg-nude/15 px-2 py-1 transition-all duration-700 ${
                phase >= 1 && phase < 3 ? "left-[55%] opacity-100" : phase >= 3 ? "left-[110%] opacity-0" : "left-[-30%] opacity-100"
              }`}
            >
              <span className="font-mono text-[9px] text-ink sm:text-[10px]">{WALLET}</span>
            </div>
          </div>

          {/* Machine */}
          <div
            className={`relative z-10 flex h-20 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-nude/30 bg-nude/10 ${
              phase >= 2 ? "anim-machine-shake" : ""
            }`}
          >
            <div className="h-6 w-8 rounded border border-white/15 bg-black/60" />
            <p className="mt-1 text-[8px] text-nude-muted">OnFRA</p>
            {phase >= 2 && phase < 4 && (
              <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-nude" />
            )}
          </div>

          {/* Right belt */}
          <div className="relative h-16 flex-1 overflow-hidden rounded-lg border border-white/8 bg-black/50">
            <div className="absolute inset-0 opacity-30 hero-belt-texture" />
            <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-1 p-2">
              {OUTPUTS.map((o, i) => (
                <span
                  key={o.short}
                  className={`rounded border border-nude/25 bg-nude/15 px-1.5 py-0.5 font-mono text-[8px] text-nude-soft transition-all duration-500 ${
                    phase >= 4 + i ? "scale-100 opacity-100" : "scale-75 opacity-0"
                  }`}
                >
                  {o.short}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimShell>
  );
}
