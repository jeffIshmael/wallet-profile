"use client";

import { type ReactNode } from "react";
import { useCountUp } from "@/hooks/useCountUp";

type SemiCircularGaugeProps = {
  value: number;
  max?: number;
  scoreLabel?: string;
  showScoreFooter?: boolean;
  accentColor?: string;
  centerContent?: React.ReactNode;
};

export function SemiCircularGauge({
  value,
  max = 100,
  scoreLabel,
  showScoreFooter = false,
  accentColor = "#f7931a",
  centerContent
}: SemiCircularGaugeProps) {
  const animated = useCountUp(value);
  const pct = Math.round((animated / max) * 100);
  const tickCount = 48;
  const activeTicks = Math.round((pct / 100) * (tickCount - 1));

  const cx = 110;
  const cy = 110;
  const innerR = 72;
  const outerR = 88;
  const needleAngle = -180 + (pct / 100) * 180;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="relative h-[110px] w-full max-w-[220px]">
        <svg viewBox="0 0 220 130" className="h-full w-full" aria-label={`Score ${pct}%`}>
          <path
            d={`M ${cx - innerR} ${cy} A ${innerR} ${innerR} 0 0 1 ${cx + innerR} ${cy}`}
            fill="none"
            className="gauge-arc-track"
            strokeWidth="1"
          />

          {Array.from({ length: tickCount }, (_, i) => {
            const angle = -180 + (i / (tickCount - 1)) * 180;
            const rad = (angle * Math.PI) / 180;
            const x1 = cx + Math.cos(rad) * innerR;
            const y1 = cy + Math.sin(rad) * innerR;
            const x2 = cx + Math.cos(rad) * outerR;
            const y2 = cy + Math.sin(rad) * outerR;
            const active = i <= activeTicks;

            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={active ? accentColor : undefined}
                className={active ? undefined : "gauge-tick-inactive"}
                strokeWidth={active ? 3 : 2.5}
                strokeLinecap="round"
              />
            );
          })}

          <g transform={`rotate(${needleAngle + 90} ${cx} ${cy})`}>
            <polygon points={`${cx},${cy - innerR + 6} ${cx - 5},${cy - innerR + 18} ${cx + 5},${cy - innerR + 18}`} className="gauge-needle" />
          </g>

          {!centerContent && (
            <>
              <text x={cx} y={cy - 8} textAnchor="middle" className="gauge-score-value fill-white font-mono text-[1.75rem] font-bold">
                {pct}
              </text>
              <text x={cx + 22} y={cy - 2} textAnchor="start" className="fill-stardust text-[0.65rem] font-semibold">
                %
              </text>
            </>
          )}
        </svg>

        {centerContent && (
          <div className="pointer-events-none absolute inset-x-0 bottom-6 flex items-center justify-center text-4xl">
            {centerContent}
          </div>
        )}
      </div>

      {(showScoreFooter || scoreLabel) && (
        <p className="gauge-score-footer -mt-1 text-center text-[11px] text-white">
          {scoreLabel ?? (
            <>
              Your Score{" "}
              <span className="font-mono font-bold" style={{ color: accentColor }}>
                {animated} / {max}
              </span>
            </>
          )}
        </p>
      )}
    </div>
  );
}
