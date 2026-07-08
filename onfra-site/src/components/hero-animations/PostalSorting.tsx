"use client";

import { AnimShell, OUTPUTS, useAnimCycle, usePhases, WALLET } from "./shared";

export function PostalSorting({ compact }: { compact?: boolean }) {
  const cycle = useAnimCycle();
  const phase = usePhases(cycle, [500, 1600, 2400, 3200, 4000, 4800, 5600, 6400]);

  return (
    <AnimShell compact={compact}>
      <div className={compact ? "p-4" : "p-6"}>
        <div className="mx-auto max-w-xs">
          {/* Slot + envelope */}
          <div className="relative mx-auto h-14 w-40 rounded-t-xl border border-white/10 bg-black/40">
            <div
              className={`absolute left-1/2 top-2 h-10 w-16 -translate-x-1/2 rounded border border-nude/30 bg-nude/10 transition-all duration-700 ${
                phase >= 1 && phase < 3
                  ? "translate-y-4 opacity-100"
                  : phase >= 3
                    ? "translate-y-8 opacity-0"
                    : "-translate-y-6 opacity-0"
              }`}
            >
              <p className="p-1 font-mono text-[7px] text-ink-muted">{WALLET}</p>
            </div>
            {phase >= 2 && phase < 4 && (
              <p className="absolute bottom-1 left-0 right-0 text-center text-[8px] text-nude-muted anim-stamp">
                STAMPED
              </p>
            )}
          </div>

          {/* Sorting machine body */}
          <div className="border border-t-0 border-white/10 bg-nude/5 px-3 py-4">
            <p className="text-center text-[9px] uppercase tracking-widest text-ink-faint">OnFRA sort</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {OUTPUTS.map((o, i) => (
                <div
                  key={o.short}
                  className={`rounded border border-white/8 bg-black/30 p-1.5 text-center transition-all duration-500 ${
                    phase >= 4 + i ? "border-nude/30 opacity-100" : "opacity-30"
                  }`}
                >
                  <div className="mx-auto mb-1 h-4 w-full rounded-sm bg-nude/20" />
                  <p className="text-[7px] text-nude-soft">{o.short}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AnimShell>
  );
}
