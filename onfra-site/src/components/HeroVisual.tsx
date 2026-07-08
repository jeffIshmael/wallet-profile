"use client";

import { useEffect, useState } from "react";

const WALLET = "0x4821…a3f2";

const REPUTATION_TAGS = [
  "Income",
  "Health",
  "Score",
  "Capacity",
  "Txns",
  "Report"
] as const;

const LOOP_MS = 6000;

export function HeroPreview() {
  const [cycle, setCycle] = useState(0);
  const [visibleTags, setVisibleTags] = useState(0);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    setVisibleTags(0);
    setScanning(false);

    const scanOn = window.setTimeout(() => setScanning(true), 1000);
    const tagTimers = REPUTATION_TAGS.map((_, i) =>
      window.setTimeout(() => setVisibleTags(i + 1), 2400 + i * 320)
    );
    const loop = window.setInterval(() => setCycle((c) => c + 1), LOOP_MS);

    return () => {
      window.clearTimeout(scanOn);
      tagTimers.forEach(window.clearTimeout);
      window.clearInterval(loop);
    };
  }, [cycle]);

  return (
    <div className="hero-visual relative z-10 w-full">
      <div className="relative w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/animation_image.png"
          alt="Wallet address enters OnFRA scanner and emerges as financial reputation signals"
          className="block h-auto w-full"
        />

        <div className="pointer-events-none absolute left-[14%] top-[54%] -translate-y-1/2 sm:left-[16%]">
          <span className="rounded-md border border-white/15 bg-black/55 px-2 py-1 font-mono text-[9px] text-nude-soft shadow-lg backdrop-blur-sm sm:text-[10px]">
            {WALLET}
          </span>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[38%] -translate-x-1/2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-widest transition-colors duration-500 sm:text-[10px] ${
              scanning
                ? "border-nude/50 bg-nude/20 text-nude-soft"
                : "border-white/10 bg-black/40 text-ink-faint"
            }`}
          >
            OnFRA
          </span>
        </div>

        {scanning && (
          <div className="pointer-events-none absolute left-1/2 top-[42%] h-10 w-16 -translate-x-1/2 rounded-lg border border-nude/30 bg-nude/10 anim-scanner-pulse" />
        )}

        <div className="pointer-events-none absolute right-[6%] top-[48%] flex flex-col gap-1.5 sm:right-[8%]">
          {REPUTATION_TAGS.map((tag, i) => (
            <span
              key={tag}
              className={`rounded-md border px-2 py-0.5 font-mono text-[8px] transition-all duration-500 sm:text-[9px] ${
                i < visibleTags
                  ? "translate-x-0 border-nude/35 bg-nude/15 text-nude-soft opacity-100"
                  : "translate-x-3 border-transparent bg-transparent text-transparent opacity-0"
              }`}
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** @deprecated use HeroPreview */
export function HeroVisual() {
  return <HeroPreview />;
}
