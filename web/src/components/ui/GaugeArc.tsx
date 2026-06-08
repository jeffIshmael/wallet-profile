"use client";

import { useCountUp } from "@/hooks/useCountUp";
import { getFinancialHealthColor } from "@/lib/format";

export function CircularGauge({
  value,
  max = 100,
  size = "md"
}: {
  value: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const animated = useCountUp(value);
  const r = size === "sm" ? 36 : 88;
  const stroke = size === "sm" ? 8 : 14;
  const viewBox = size === "sm" ? "0 0 96 96" : "0 0 200 200";
  const cx = size === "sm" ? 48 : 100;
  const circ = 2 * Math.PI * r;
  const dash = (animated / max) * circ;
  const color = getFinancialHealthColor(value);
  const dim = size === "sm" ? "h-24 w-24" : "h-48 w-48 sm:h-56 sm:w-56";
  const fontSize = size === "sm" ? "1.25rem" : "2.7rem";

  return (
    <svg viewBox={viewBox} className={dim} aria-label={`Financial health ${value}%`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: "stroke-dasharray 600ms ease" }}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#ffffff"
        style={{ fontFamily: "var(--font-sora)", fontSize, fontWeight: 800 }}
      >
        {animated}%
      </text>
    </svg>
  );
}

export function SemiGauge({ value }: { value: number }) {
  const animated = useCountUp(value);
  const ticks = Array.from({ length: 40 }, (_, index) => {
    const angle = -180 + (index / 39) * 180;
    const active = index <= Math.round((animated / 100) * 39);
    return { angle, active };
  });
  const needleAngle = -90 + (animated / 100) * 180;

  return (
    <svg viewBox="0 0 220 140" className="h-32 w-full" aria-label={`Reputation score ${value} out of 100`}>
      {ticks.map((tick) => (
        <line
          key={tick.angle}
          x1="110"
          y1="110"
          x2="110"
          y2="94"
          stroke={tick.active ? "var(--color-primary)" : "var(--color-border)"}
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${tick.angle} 110 110) translate(0 -74)`}
        />
      ))}
      <g transform={`rotate(${needleAngle} 110 110)`}>
        <path d="M110 28 L115 110 L105 110 Z" fill="var(--color-primary-dark)" />
      </g>
      <circle cx="110" cy="110" r="7" fill="var(--color-primary)" />
      <text x="110" y="95" textAnchor="middle" className="fill-white font-sora text-[2rem] font-extrabold">
        {animated}
      </text>
      <text x="110" y="116" textAnchor="middle" className="fill-stardust text-[0.75rem] font-semibold">
        /100
      </text>
    </svg>
  );
}
