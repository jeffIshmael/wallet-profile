"use client";

import { motion } from "framer-motion";

type ScoreOutputCardsProps = {
  compact?: boolean;
  delay?: number;
};

const cards = [
  { label: "Financial Health", value: "92", accent: "text-btc-orange" },
  { label: "Reputation", value: "88", accent: "text-btc-orange" },
  { label: "Income Stability", value: "95%", accent: "text-btc-gold" },
  { label: "Loan Capacity", value: "$2,400", accent: "text-white" }
];

export function ScoreOutputCards({ compact, delay = 0 }: ScoreOutputCardsProps) {
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: delay + i * 0.15, duration: 0.4 }}
          className="rounded-xl border border-white/10 bg-void-surface/80 px-3 py-2 backdrop-blur-sm"
        >
          <p className="font-mono text-[9px] uppercase tracking-wider text-stardust">{card.label}</p>
          <p className={`font-mono text-sm font-medium ${card.accent}`}>{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
