"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Wallet } from "lucide-react";
import { shortAddress } from "@/lib/walletAddress";

const STEPS = [
  "Fetching Celo transactions",
  "Sorting inflows and outflows",
  "Estimating income",
  "Scoring financial health",
  "Preparing your dashboard"
];

const STEP_MS = 1100;

type Props = {
  wallet: string;
  onDone: () => void;
  onCancel: () => void;
};

/** A token chip that rides an orbit ring and stays upright. */
function OrbitChip({
  label,
  angle,
  direction,
  duration,
  tone
}: {
  label: string;
  angle: number;
  direction: "cw" | "ccw";
  duration: number;
  tone: string;
}) {
  return (
    <div
      className="absolute inset-0"
      style={{ transform: `rotate(${angle}deg)` }}
    >
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <span
          className={`chip-up-${direction} flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/80 bg-white px-3 py-1 text-[11px] font-bold text-[#111017] shadow-lg shadow-[#564870]/20`}
          style={{ ["--a" as string]: `${angle}deg`, animationDuration: `${duration}s` }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: tone }} />
          {label}
        </span>
      </div>
    </div>
  );
}

export function WalletAnalyzingScreen({ wallet, onDone, onCancel }: Props) {
  const [completed, setCompleted] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (completed >= STEPS.length) {
      const t = setTimeout(() => onDoneRef.current(), 650);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCompleted((c) => c + 1), completed === 0 ? 1400 : STEP_MS);
    return () => clearTimeout(t);
  }, [completed]);

  const progress = Math.round((completed / STEPS.length) * 100);

  return (
    <div className="entry-bg relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12 font-inter text-[#111017]">
      <div className="entry-pattern" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-[#b7aedb]/25 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        {/* Orbit stage */}
        <div className="relative h-[290px] w-[290px] sm:h-[330px] sm:w-[330px]">
          {/* Radar sweep */}
          <div className="analyze-sweep absolute inset-4 rounded-full" />

          {/* Pulses from the core */}
          <span className="analyze-pulse absolute inset-1/2 -ml-12 -mt-12 h-24 w-24 rounded-full border-2 border-[#564870]/50" />
          <span
            className="analyze-pulse absolute inset-1/2 -ml-12 -mt-12 h-24 w-24 rounded-full border-2 border-[#564870]/50"
            style={{ animationDelay: "1.1s" }}
          />

          {/* Outer ring, clockwise */}
          <div className="orbit-cw absolute inset-0 rounded-full border border-dashed border-[#564870]/35">
            <OrbitChip label="CELO" angle={0} direction="cw" duration={18} tone="#f5b862" />
            <OrbitChip label="USDT" angle={120} direction="cw" duration={18} tone="#0fb27a" />
            <OrbitChip label="USDC" angle={240} direction="cw" duration={18} tone="#2f6fd0" />
          </div>

          {/* Inner ring, counter-clockwise */}
          <div className="orbit-ccw absolute inset-[3.75rem] rounded-full border border-dashed border-[#564870]/25 sm:inset-[4.25rem]">
            <OrbitChip label="cUSD" angle={60} direction="ccw" duration={12} tone="#7a6aa8" />
            <span className="absolute left-1/2 top-full h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#564870]" />
          </div>

          {/* Core */}
          <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.75rem] border border-white/80 bg-white shadow-2xl shadow-[#564870]/30">
            <div className="analyze-core flex h-14 w-14 items-center justify-center rounded-2xl bg-[#564870] text-white">
              <Wallet className="h-7 w-7" />
            </div>
          </div>
        </div>

        {/* Copy */}
        <h1
          role="status"
          aria-live="polite"
          className="mt-8 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl"
        >
          Analyzing your wallet
        </h1>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 font-mono text-xs font-medium text-[#43385a] backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {shortAddress(wallet)}
        </div>

        {/* Steps */}
        <ul className="mt-8 w-full max-w-xs space-y-3 text-left">
          {STEPS.map((label, i) => {
            const done = i < completed;
            const active = i === completed;
            return (
              <li
                key={label}
                className={`flex items-center gap-3 text-sm font-medium transition-opacity duration-300 ${
                  done || active ? "opacity-100" : "opacity-40"
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                    done
                      ? "bg-[#564870] text-white"
                      : active
                        ? "bg-white text-[#564870] shadow"
                        : "border border-[#564870]/30 text-transparent"
                  }`}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  ) : active ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : null}
                </span>
                <span className={done ? "text-[#4a4655]" : "text-[#111017]"}>{label}</span>
              </li>
            );
          })}
        </ul>

        {/* Progress */}
        <div
          className="mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-white/60"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#564870] to-[#9d8fd0] transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="mt-6 text-xs font-semibold text-[#6f6b7a] underline-offset-4 transition hover:text-[#111017] hover:underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}