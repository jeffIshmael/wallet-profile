"use client";

import { type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SemiCircularGauge } from "@/components/ui/SemiCircularGauge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useCountUp } from "@/hooks/useCountUp";
import { getFinancialHealthColor } from "@/lib/format";

type BadgeVariant = "green" | "amber" | "red" | "blue";
type VisualVariant = "ring" | "animal" | "gauge";

type ScoreCardProps = {
  title: string;
  score: number;
  maxScore?: number;
  badge: string;
  badgeVariant: BadgeVariant;
  description?: string;
  icon?: ReactNode;
  visual?: VisualVariant;
  gaugeCenter?: ReactNode;
  showGaugeFooter?: boolean;
  help: {
    meaning: string;
    calculation: string;
    lenderRelevance: string;
  };
};

function scoreTint(score: number) {
  if (score >= 80) return "bg-[rgba(34,211,164,0.04)]";
  if (score >= 50) return "bg-[rgba(184,176,200,0.04)]";
  return "bg-[rgba(239,68,68,0.04)]";
}

function ScoreRing({ value, max = 100 }: { value: number; max?: number }) {
  const animated = useCountUp(value);
  const r = 44;
  const stroke = 7;
  const circ = 2 * Math.PI * r;
  const dash = (animated / max) * circ;
  const color = getFinancialHealthColor(value);

  return (
    <svg viewBox="0 0 100 100" className="h-[88px] w-[88px]" aria-hidden>
      <circle cx={50} cy={50} r={r} fill="none" className="score-ring-track" strokeWidth={stroke} />
      <circle
        cx={50}
        cy={50}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="50"
        dominantBaseline="central"
        textAnchor="middle"
        className="score-ring-value fill-white font-mono text-lg font-bold"
      >
        {animated}
      </text>
    </svg>
  );
}

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  badge,
  badgeVariant,
  description,
  icon,
  visual = "ring",
  gaugeCenter,
  showGaugeFooter = false,
  help
}: ScoreCardProps) {
  const pct = Math.round((score / maxScore) * 100);

  return (
    <Card compact className={`flex h-full flex-col ${scoreTint(score)}`}>
      <SectionHeader compact title={title} help={help} />

      <div className="mt-1 flex flex-1 flex-col items-center justify-center gap-1.5 text-center">
        {visual === "ring" && <ScoreRing value={pct} />}
        {visual === "animal" && (
          <span className="text-5xl leading-none" role="img" aria-label={badge}>
            {icon}
          </span>
        )}
        {visual === "gauge" && (
          <SemiCircularGauge
            value={score}
            max={maxScore}
            showScoreFooter={showGaugeFooter}
            accentColor="#B8B0C8"
            centerContent={gaugeCenter}
          />
        )}
        <StatusBadge tone={badgeVariant}>{badge}</StatusBadge>
        {description && <p className="line-clamp-2 px-1 text-[10px] leading-4 text-stardust">{description}</p>}
      </div>
    </Card>
  );
}
