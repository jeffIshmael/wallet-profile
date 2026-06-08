"use client";

import { motion } from "framer-motion";
import {  ORBITAL_PARTICLES } from "@/components/landing/design-4/hero/animation-data";

const CYCLE = 22;
const ORBIT_R = 72;

const OUTPUT_CARDS = [
  { label: "Health", value: "89", fullLabel: "Financial Health" },
  { label: "Reputation", value: "91", fullLabel: "Reputation" },
  { label: "Income", value: "Stable Earner", fullLabel: "Income Stability" },
  { label: "Loan", value: "$2,400", fullLabel: "Est. Loan Capacity" }
];

// Wallet enters from left, arcs along top-left of orbit, spirals into lens
const WALLET_PATH = [
  { x: -120, y: 0 },
  { x: -ORBIT_R, y: 0 },
  { x: -51, y: -51 },
  { x: 0, y: -ORBIT_R },
  { x: 36, y: -36 },
  { x: 0, y: 0 }
];

// Keep analysing particles on the left/bottom arc — away from the output column
const PARTICLE_ANGLES = [Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4, Math.PI / 4, Math.PI / 2];

function OutputCard({ label, value, fullLabel, index }: (typeof OUTPUT_CARDS)[number] & { index: number }) {
  return (
    <motion.div
      animate={{
        opacity: [0, 0, 1, 1, 0],
        scale: [0.92, 0.92, 1, 1, 0.92]
      }}
      transition={{
        duration: CYCLE,
        repeat: Infinity,
        ease: "easeOut",
        delay: index * 0.2,
        times: [0, 0.58 + index * 0.02, 0.66 + index * 0.02, 0.88, 0.96]
      }}
      className="flex h-[52px] flex-col justify-center rounded-lg border border-white/10 bg-black/70 px-2.5 backdrop-blur-sm"
      title={fullLabel}
    >
      <p className="truncate font-mono text-[7px] uppercase tracking-wider text-stardust">{fullLabel}</p>
      <p className="font-mono text-sm font-medium text-btc-orange">{value}</p>
    </motion.div>
  );
}

export function OrbitalLensAnimation() {
  return (
    <div className="flex min-h-[360px] flex-col md:min-h-[400px]">
      <div className="grid flex-1 grid-cols-[72px_1fr_120px] items-center gap-1 px-3 py-5 md:grid-cols-[80px_1fr_140px] md:gap-2 md:px-4">
        {/* Left — input zone */}
        <div className="flex h-full flex-col items-center justify-center">
          <p className="mb-2 font-mono text-[8px] uppercase tracking-widest text-stardust/50">Input</p>
          <motion.div
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: CYCLE, repeat: Infinity, times: [0, 0.06, 0.18, 0.22] }}
            className="rounded-md border border-btc-orange/30 bg-black/60 px-2 py-1 font-mono text-[9px] text-btc-orange/80"
          >
            0x7A3…
          </motion.div>
        </div>

        {/* Center — orbit only */}
        <div className="relative mx-auto aspect-square w-full max-w-[200px]">
          <div className="absolute inset-0 rounded-full bg-btc-orange/5 blur-2xl" />

          <svg className="absolute inset-0 h-full w-full" viewBox="-100 -100 200 200">
            <circle
              cx="0"
              cy="0"
              r={ORBIT_R}
              fill="none"
              stroke="rgba(247,147,26,0.12)"
              strokeWidth="1"
              strokeDasharray="3 5"
            />
            <motion.path
              d={`M ${-ORBIT_R} 0 A ${ORBIT_R} ${ORBIT_R} 0 0 1 0 ${-ORBIT_R}`}
              fill="none"
              stroke="rgba(247,147,26,0.4)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 0, 1, 1, 0], opacity: [0, 0, 0.7, 0.7, 0] }}
              transition={{ duration: CYCLE, repeat: Infinity, times: [0, 0.04, 0.16, 0.7, 0.88] }}
            />
          </svg>

          <motion.div
            className="absolute inset-[4%] rounded-full border border-btc-orange/15"
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-[18%] rounded-full border border-dashed border-btc-gold/15"
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />

          {/* Wallet */}
          <motion.div
            className="absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
            animate={{
              x: WALLET_PATH.map((p) => p.x),
              y: WALLET_PATH.map((p) => p.y),
              opacity: [0, 1, 1, 1, 1, 1, 0],
              scale: [1, 1, 1, 1, 0.85, 0.4, 0]
            }}
            transition={{
              duration: CYCLE,
              repeat: Infinity,
              ease: "easeInOut",
              times: [0, 0.04, 0.08, 0.11, 0.14, 0.17, 0.2]
            }}
          >
            <div className="whitespace-nowrap rounded-md border border-btc-orange/50 bg-black/90 px-2.5 py-1.5 font-mono text-[10px] text-btc-orange shadow-[0_0_16px_-4px_rgba(247,147,26,0.5)]">
              0x7A3...F91
            </div>
          </motion.div>

          {/* Lens */}
          <motion.div
            className="absolute left-1/2 top-1/2 z-10 flex h-[88px] w-[88px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-btc-orange/50 bg-black/60 backdrop-blur-md"
            animate={{
              boxShadow: [
                "0 0 24px -8px rgba(247,147,26,0.15)",
                "0 0 24px -8px rgba(247,147,26,0.15)",
                "0 0 48px -4px rgba(247,147,26,0.5)",
                "0 0 48px -4px rgba(247,147,26,0.5)",
                "0 0 24px -8px rgba(247,147,26,0.15)"
              ]
            }}
            transition={{ duration: CYCLE, repeat: Infinity, times: [0, 0.17, 0.2, 0.62, 1] }}
          >
            <span className="text-center font-dancing text-sm font-semibold leading-tight text-btc-orange">
              Wallet
              <br />
              Profile
            </span>
          </motion.div>

          {/* Analysing particles — left side of orbit only */}
          {ORBITAL_PARTICLES.map((particle, i) => {
            const angle = PARTICLE_ANGLES[i] ?? Math.PI;
            const orbitX = Math.cos(angle) * ORBIT_R;
            const orbitY = Math.sin(angle) * ORBIT_R;

            return (
              <motion.div
                key={particle.title}
                className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-void-surface/90 px-1.5 py-0.5 font-mono text-[7px] text-stardust"
                animate={{
                  x: [orbitX, orbitX * 0.6, 0, orbitX],
                  y: [orbitY, orbitY * 0.6, 0, orbitY],
                  opacity: [0, 0, 1, 1, 0, 0],
                  scale: [0.8, 0.8, 1, 1, 0.2, 0.8]
                }}
                transition={{
                  duration: CYCLE,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.32, 0.52, 0.64, 1]
                }}
                title={particle.title}
              >
                {particle.label}
              </motion.div>
            );
          })}
        </div>

        {/* Right — output grid */}
        <div className="flex flex-col">
          <p className="mb-2 text-center font-mono text-[8px] uppercase tracking-widest text-stardust/50">Output</p>
          <div className="grid grid-cols-1 gap-1.5">
            {OUTPUT_CARDS.map((card, i) => (
              <OutputCard key={card.fullLabel} {...card} index={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 py-2.5 text-center font-mono text-[8px] uppercase tracking-widest text-stardust/50">
        Wallet → Wallet Profile → Intelligence
      </div>
    </div>
  );
}
