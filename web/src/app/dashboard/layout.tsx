"use client";

import { useEffect, useState } from "react";
import { AnalysisLoading } from "@/components/layout/AnalysisLoading";
import { hasCompletedAnalysis, markAnalysisComplete } from "@/lib/dashboardSession";

const ANALYSIS_STEP_MS = 1400;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(() => hasCompletedAnalysis());
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    if (hasCompletedAnalysis()) {
      setReady(true);
      return;
    }

    setAnalysisStep(0);
    const timers = [0, 1, 2, 3].map((step) =>
      window.setTimeout(() => setAnalysisStep(step), step * ANALYSIS_STEP_MS)
    );
    const finish = window.setTimeout(() => {
      markAnalysisComplete();
      setReady(true);
    }, 4 * ANALYSIS_STEP_MS);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finish);
    };
  }, []);

  if (!ready) {
    return <AnalysisLoading step={analysisStep} />;
  }

  return children;
}
