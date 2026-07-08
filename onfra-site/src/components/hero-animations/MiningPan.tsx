"use client";

import { AnimShell, OUTPUTS, useAnimCycle, usePhases, WALLET } from "./shared";

export function MiningPan({ compact }: { compact?: boolean }) {
  const cycle = useAnimCycle();
  const phase = usePhases(cycle, [400, 1400, 2200, 3000, 3800, 4600, 5400, 6200]);

  return (
    <AnimShell compact={compact}>
      <div className={`flex flex-col items-center ${compact ? "p-4" : "p-6"}`}>
        {/* Gravel pour */}
        <div className="relative h-8 w-full max-w-[200px]">
          {phase >= 1 && phase < 3 && (
            <div className="flex justify-center gap-1 anim-gravel-fall">
              {["·", "·", "·", "·", "·"].map((d, i) => (
                <span key={i} className="text-[10px] text-ink-faint">
                  {d}
                </span>
              ))}
            </div>
          )}
          <p className="text-center font-mono text-[9px] text-nude-muted">{WALLET}</p>
        </div>

        {/* Pan */}
        <div
          className={`relative mt-2 h-10 w-32 rounded-b-[3rem] border-2 border-nude/30 bg-gradient-to-b from-white/5 to-nude/10 ${
            phase >= 2 && phase < 5 ? "anim-pan-shake" : ""
          }`}
        >
          <div className="absolute inset-x-2 bottom-1 h-1 rounded-full bg-ink-faint/30" />
        </div>

        {/* Nuggets */}
        <div className="mt-5 grid w-full grid-cols-3 gap-2 sm:grid-cols-6">
          {OUTPUTS.map((o, i) => (
            <div
              key={o.short}
              className={`flex flex-col items-center transition-all duration-500 ${
                phase >= 4 + i ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-nude/40 bg-gradient-to-br from-nude/30 to-nude/10 shadow-glow">
                <span className="text-[9px] text-nude-soft">◆</span>
              </div>
              <p className="mt-1 text-center text-[8px] text-ink-faint">{o.short}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimShell>
  );
}
