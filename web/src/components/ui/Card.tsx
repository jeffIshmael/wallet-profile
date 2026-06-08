"use client";

import { type HTMLMotionProps, motion } from "framer-motion";
import { clsx } from "clsx";
import { fadeUp } from "@/lib/motion";

type CardProps = HTMLMotionProps<"section"> & {
  children: React.ReactNode;
  compact?: boolean;
};

export function Card({ className, children, compact = false, ...props }: CardProps) {
  return (
    <motion.section
      variants={fadeUp}
      className={clsx(
        "rounded-xl border border-white/10 border-t-white/[0.06] bg-void-surface shadow-[0_0_20px_-10px_rgba(247,147,26,0.08)] transition-shadow hover:shadow-[0_0_0_1px_rgba(245,166,35,0.12)]",
        compact ? "p-3" : "p-5",
        className
      )}
      {...props}
    >
      {children}
    </motion.section>
  );
}
