"use client";

import { AnimShell, OUTPUTS, useAnimCycle, usePhases } from "./shared";

export function TeaStrainer({ compact }: { compact?: boolean }) {
  const cycle = useAnimCycle();
  const phase = usePhases(cycle, [400, 1400, 2600, 3400, 4200, 5000, 5800, 6600]);

  return (
    <AnimShell compact={compact}>
      <div className={`flex flex-col items-center ${compact ? "p-4" : "p-6"}`}>
        {/* Teapot */}
        <div className="relative">
          <div
            className={`h-9 w-14 rounded-full border border-nude/30 bg-nude/10 transition-transform duration-700 ${
              phase >= 1 ? "rotate-[-20deg]" : ""
            }`}
          />
          <div className="absolute -right-2 top-3 h-2 w-4 rounded-r-full border border-nude/25 bg-nude/15" />
          {phase >= 1 && phase < 4 && (
            <span className="absolute -bottom-6 left-1/2 anim-pour-stream block h-8 w-0.5 -translate-x-1/2 bg-gradient-to-b from-nude-soft/80 to-nude/30" />
          )}
        </div>

        {/* Strainer */}
        <div
          className={`relative mt-8 h-3 w-16 rounded-full border border-nude/40 bg-nude/15 ${
            phase >= 2 ? "opacity-100" : "opacity-50"
          }`}
        >
          <div className="absolute inset-x-2 top-0.5 h-px bg-white/20" />
        </div>

        {/* Tea cups */}
        <div className="mt-4 grid w-full grid-cols-3 gap-2 sm:grid-cols-6">
          {OUTPUTS.map((o, i) => (
            <div key={o.short} className="flex flex-col items-center">
              <div className="relative h-9 w-full">
                <div className="absolute bottom-0 left-1/2 h-7 w-7 -translate-x-1/2 rounded-b-full border border-nude/25 bg-black/30">
                  <div
                    className="absolute bottom-0 left-0 right-0 rounded-b-full bg-nude/25 transition-all duration-700"
                    style={{ height: phase >= 3 + i ? `${50 + i * 6}%` : "0%" }}
                  />
                </div>
              </div>
              <p className="mt-1 text-[8px] text-ink-faint">{o.short}</p>
            </div>
          ))}
        </div>
      </div>
    </AnimShell>
  );
}
