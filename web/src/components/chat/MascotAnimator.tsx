"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function MascotAnimator({
  status,
  size = 64
}: {
  status: "idle" | "thinking" | "generating";
  size?: number;
}) {
  const isWorking = status !== "idle";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background glow when working */}
      <motion.div
        animate={
          isWorking
            ? {
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }
            : {
                scale: 1,
                opacity: 0
              }
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full bg-primary blur-xl"
      />

      {/* Mascot floating & tilting */}
      <motion.div
        animate={
          isWorking
            ? {
                y: [0, -6, 0],
                rotate: [0, -4, 4, 0]
              }
            : {
                y: [0, -2, 0],
                rotate: 0
              }
        }
        transition={{
          y: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotate: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        className="relative z-10"
      >
        <Image
          src="/apple-icon.png"
          alt="OnFRA Agent"
          width={size}
          height={size}
          className="drop-shadow-lg"
          unoptimized
        />
        
        {/* Subtle pulse */}
        <motion.div
          animate={{
            opacity: [0, 0.1, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.1, 1],
            ease: "linear"
          }}
          className="absolute inset-0 rounded-full bg-white mix-blend-overlay"
        />
      </motion.div>
    </div>
  );
}
