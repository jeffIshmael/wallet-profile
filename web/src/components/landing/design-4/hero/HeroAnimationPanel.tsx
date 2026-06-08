"use client";

import { motion } from "framer-motion";
import { OrbitalLensAnimation } from "@/components/landing/design-4/hero/animations/OrbitalLensAnimation";

export function HeroAnimationPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_0_50px_-10px_rgba(247,147,26,0.15)] backdrop-blur-lg md:min-w-[420px]"
    >
      <OrbitalLensAnimation />
    </motion.div>
  );
}
