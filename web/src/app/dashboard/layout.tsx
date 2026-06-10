"use client";

import { useEffect, useState } from "react";
import { AnalysisLoading } from "@/components/layout/AnalysisLoading";
import { AnalyzeWalletPrompt } from "@/components/layout/AnalyzeWalletPrompt";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { hasCompletedAnalysis, markAnalysisComplete } from "@/lib/dashboardSession";

const ANALYSIS_STEP_MS = 1400;

type DashboardPhase = "prompt" | "loading" | "ready";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { address } = useWalletAuth();
  const [phase, setPhase] = useState<DashboardPhase>(() =>
    hasCompletedAnalysis() ? "ready" : "prompt"
  );
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    if (phase !== "loading") return;

    setAnalysisStep(0);
    const timers = [0, 1, 2, 3].map((step) =>
      window.setTimeout(() => setAnalysisStep(step), step * ANALYSIS_STEP_MS)
    );
    const finish = window.setTimeout(() => {
      markAnalysisComplete();
      setPhase("ready");
    }, 4 * ANALYSIS_STEP_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, [phase]);

  if (phase === "prompt") {
    return <AnalyzeWalletPrompt address={address} onAnalyze={() => setPhase("loading")} />;
  }

  if (phase === "loading") {
    return <AnalysisLoading step={analysisStep} />;
  }

  return children;
}
