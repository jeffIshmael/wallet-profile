"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnalysisLoading } from "@/components/layout/AnalysisLoading";
import { AnalyzeWalletPrompt } from "@/components/layout/AnalyzeWalletPrompt";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useWalletData } from "@/hooks/useWalletData";
import { hasCompletedAnalysis, loadWalletData } from "@/lib/dashboardSession";
import { WalletDataProvider } from "@/providers/WalletDataProvider";

const ANALYSIS_STEP_MS = 1400;

type DashboardPhase = "prompt" | "loading" | "ready";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analyzeRequested = searchParams.get("analyze") === "1";
  const { address } = useWalletAuth();
  const { analyzeWallet, isAnalyzing } = useWalletData();
  const [phase, setPhase] = useState<DashboardPhase>(() => (analyzeRequested ? "loading" : "prompt"));
  const [analysisStep, setAnalysisStep] = useState(0);
  const autoAnalyzeStarted = useRef(false);

  useEffect(() => {
    autoAnalyzeStarted.current = false;
  }, [address]);

  const startAnalysis = useCallback(async () => {
    if (!address) return;
    setPhase("loading");
    try {
      await analyzeWallet(address);
      setPhase("ready");
    } catch {
      setPhase("prompt");
    }
  }, [address, analyzeWallet]);

  useEffect(() => {
    if (!address) {
      setPhase("prompt");
      return;
    }

    if (hasCompletedAnalysis() && loadWalletData(address)) {
      setPhase("ready");
      return;
    }

    if (analyzeRequested && !autoAnalyzeStarted.current) {
      autoAnalyzeStarted.current = true;
      router.replace("/dashboard");
      void startAnalysis();
      return;
    }

    setPhase("prompt");
  }, [address, analyzeRequested, router, startAnalysis]);

  useEffect(() => {
    if (phase !== "loading") return;

    setAnalysisStep(0);
    const timers = [0, 1, 2, 3].map((step) =>
      window.setTimeout(() => setAnalysisStep(step), step * ANALYSIS_STEP_MS)
    );

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [phase]);

  if (phase === "prompt" && !isAnalyzing) {
    return <AnalyzeWalletPrompt address={address} onAnalyze={startAnalysis} />;
  }

  if (phase === "loading" || isAnalyzing) {
    return <AnalysisLoading step={analysisStep} />;
  }

  return children;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletDataProvider>
      <Suspense fallback={<AnalysisLoading step={0} />}>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </Suspense>
    </WalletDataProvider>
  );
}
