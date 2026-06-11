"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnalysisLoading } from "@/components/layout/AnalysisLoading";
import { AnalyzeWalletPrompt } from "@/components/layout/AnalyzeWalletPrompt";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useStoredAnalysis } from "@/hooks/useStoredAnalysis";
import { useWalletData } from "@/hooks/useWalletData";
import { loadWalletPayload } from "@/lib/dashboardSession";
import { WalletDataProvider } from "@/providers/WalletDataProvider";

const ANALYSIS_STEP_MS = 1400;

type DashboardPhase = "prompt" | "loading" | "ready";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analyzeRequested = searchParams.get("analyze") === "1";
  const chatRequested = searchParams.get("chat") === "1";
  const { address } = useWalletAuth();
  const sessionCache = address ? loadWalletPayload(address) : null;
  const storedStatus = useStoredAnalysis(address);
  const { analyzeWallet, isAnalyzing, walletData, isHydrating, loadStoredWallet } = useWalletData();
  const [phase, setPhase] = useState<DashboardPhase>("prompt");
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

  const goToDashboard = useCallback(async () => {
    if (!address) return;
    if (!walletData) {
      setPhase("loading");
      const loaded = await loadStoredWallet(address);
      if (!loaded) {
        setPhase("prompt");
        return;
      }
    }
    router.replace(chatRequested ? "/dashboard?chat=1" : "/dashboard");
    setPhase("ready");
  }, [address, walletData, loadStoredWallet, router, chatRequested]);

  useEffect(() => {
    if (!address) {
      setPhase("prompt");
      return;
    }

    const hasCachedAnalysis =
      Boolean(walletData || sessionCache) || storedStatus === "yes";

    if (isHydrating && !hasCachedAnalysis) return;

    if (walletData) {
      setPhase("ready");
      if (analyzeRequested) {
        router.replace(chatRequested ? "/dashboard?chat=1" : "/dashboard");
      }
      return;
    }

    if (chatRequested && hasCachedAnalysis) {
      void loadStoredWallet(address).then((loaded) => {
        if (loaded || sessionCache) setPhase("ready");
      });
      return;
    }

    if (analyzeRequested && !autoAnalyzeStarted.current) {
      autoAnalyzeStarted.current = true;
      router.replace(chatRequested ? "/dashboard?chat=1" : "/dashboard");
      void startAnalysis();
      return;
    }

    setPhase("prompt");
  }, [
    address,
    analyzeRequested,
    chatRequested,
    router,
    startAnalysis,
    walletData,
    isHydrating,
    sessionCache,
    storedStatus,
    loadStoredWallet
  ]);

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

  const hasCachedAnalysis =
    Boolean(walletData || sessionCache) || storedStatus === "yes";

  if (isHydrating && !(chatRequested && hasCachedAnalysis)) {
    return <AnalysisLoading step={0} />;
  }

  if (phase === "prompt" && !isAnalyzing && !(chatRequested && hasCachedAnalysis)) {
    return (
      <AnalyzeWalletPrompt
        address={address}
        hasStoredAnalysis={storedStatus === "yes"}
        onAnalyze={startAnalysis}
        onGoToDashboard={goToDashboard}
      />
    );
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
