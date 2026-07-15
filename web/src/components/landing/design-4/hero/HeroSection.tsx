"use client";

import { motion } from "framer-motion";
import { ArrowRight, Bot } from "lucide-react";
import { HeroAnimationPanel } from "@/components/landing/design-4/hero/HeroAnimationPanel";
import { LandingNav } from "@/components/landing/design-4/LandingNav";
import type { StoredAnalysisStatus } from "@/hooks/useStoredAnalysis";
import { useWalletAuth } from "@/hooks/useWalletAuth";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

type HeroSectionProps = {
  onSignIn: () => void;
  onDisconnect: () => void;
  onAnalyze: () => void;
  onTryChat: () => void;
  authenticated: boolean;
  address: string | null;
  connecting?: boolean;
  storedAnalysisStatus?: StoredAnalysisStatus;
};

export function HeroSection({
  onSignIn,
  onDisconnect,
  onAnalyze,
  onTryChat,
  authenticated,
  address,
  connecting,
  storedAnalysisStatus = "unknown"
}: HeroSectionProps) {
  const { miniPay } = useWalletAuth();
  const hasStoredAnalysis = storedAnalysisStatus === "yes";

  function handleCta() {
    if (miniPay && connecting) return;
    if (!authenticated || !address) {
      if (!miniPay) onSignIn();
      return;
    }
    onAnalyze();
  }

  function ctaLabel() {
    if (miniPay && connecting) return "Connecting…";
    if (miniPay && authenticated) return hasStoredAnalysis ? "Go to Dashboard" : "Analyse My Wallet";
    if (!authenticated || !address) return miniPay ? "Connecting…" : "Sign in";
    if (hasStoredAnalysis) return "Go to Dashboard";
    return "Analyse My Wallet";
  }

  return (
    <section className="relative overflow-hidden bg-void px-6 pb-24 pt-24">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundSize: "50px 50px",
          backgroundImage:
            "linear-gradient(to right, rgba(30,41,59,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.5) 1px, transparent 1px)",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 100%)"
        }}
      />
      <div className="pointer-events-none absolute -left-20 top-20 h-64 w-64 rounded-full bg-btc-orange/10 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-btc-gold/5 blur-[120px]" />
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-64 w-[80%] -translate-x-1/2 bg-white/[0.04] blur-[100px]" />

      <LandingNav
        onSignIn={onSignIn}
        onDisconnect={onDisconnect}
        onTryChat={onTryChat}
        authenticated={authenticated}
        address={address}
        connecting={connecting}
        active="home"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 pt-12 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-16">
        <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
          <motion.h1 variants={item} className="mt-6 leading-tight">
            <span className="block font-roboto text-3xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Your Wallet Is Your
            </span>
            <span className="mt-1 block font-dancing text-5xl font-semibold text-btc-orange/60 sm:text-6xl md:text-7xl lg:text-8xl">
              Financial Reputation.
            </span>
          </motion.h1>

          <motion.p variants={item} className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-stardust md:text-lg lg:mx-0">
            Bridge onchain earnings and traditional finance. Onfra transforms raw wallet activity into verifiable
            financial intelligence lenders trust.
          </motion.p>

          <motion.div variants={item} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:items-start lg:justify-start">
            <button
              type="button"
              onClick={handleCta}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-btc-orange/80 px-6 py-3 font-mono text-xs font-medium uppercase tracking-wider text-white shadow-[0_0_20px_-5px_rgba(247,147,26,0.4)] transition hover:bg-btc-orange/90 hover:scale-105"
            >
              <span>{ctaLabel()}</span>
              <ArrowRight size={14} />
            </button>
            <a
              href="/chat"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border-2 border-primary/20 px-6 py-3 font-mono text-xs uppercase tracking-wider text-white transition hover:border-primary/50 hover:bg-primary/10"
            >
              <img src="/apple-icon.png" alt="logo" className="h-4 w-4 rounded-full" />
              Ask Agent
            </a>
          </motion.div>
        </motion.div>

        <HeroAnimationPanel />
      </div>
    </section>
  );
}
