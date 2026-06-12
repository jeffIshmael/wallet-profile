"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnalysisLoading } from "@/components/layout/AnalysisLoading";
import { AnalyzeWalletPrompt } from "@/components/layout/AnalyzeWalletPrompt";
import { DashboardBootLoading } from "@/components/layout/DashboardBootLoading";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useStoredAnalysis } from "@/hooks/useStoredAnalysis";
import { useWalletData } from "@/hooks/useWalletData";
import { hasCompletedAnalysis, loadWalletPayload } from "@/lib/dashboardSession";
import { WalletDataProvider } from "@/providers/WalletDataProvider";

const ANALYSIS_STEP_MS = 1400;

type DashboardPhase = "boot" | "prompt" | "loading" | "ready";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const analyzeRequested = searchParams.get("analyze") === "1";
  const chatRequested = searchParams.get("chat") === "1";
  const { address } = useWalletAuth();
  const sessionCache = address ? loadWalletPayload(address) : null;
  const storedStatus = useStoredAnalysis(address);
  const { analyzeWallet, isAnalyzing, walletData, isHydrating, loadStoredWallet } = useWalletData();
  const [phase, setPhase] = useState<DashboardPhase>("boot");
  const [analysisStep, setAnalysisStep] = useState(0);
  const autoAnalyzeStarted = useRef(false);
  const autoLoadStarted = useRef(false);

  useEffect(() => {
    autoAnalyzeStarted.current = false;
    autoLoadStarted.current = false;
    setPhase("boot");
  }, [address]);

  const hasCachedAnalysis =
    Boolean(walletData || sessionCache) ||
    storedStatus === "yes" ||
    (address ? hasCompletedAnalysis() : false);

  const isBooting =
    Boolean(address) &&
    (isHydrating || (storedStatus === "unknown" && !sessionCache && !walletData));

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
      setPhase("boot");
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

    if (isBooting) {
      setPhase("boot");
      return;
    }

    if (walletData) {
      setPhase("ready");
      if (analyzeRequested) {
        router.replace(chatRequested ? "/dashboard?chat=1" : "/dashboard");
      }
      return;
    }

    if (hasCachedAnalysis && !autoLoadStarted.current) {
      autoLoadStarted.current = true;
      if (sessionCache) {
        setPhase("ready");
        return;
      }
      setPhase("boot");
      void loadStoredWallet(address).then((loaded) => {
        setPhase(loaded ? "ready" : "prompt");
      });
      return;
    }

    if (analyzeRequested && !autoAnalyzeStarted.current) {
      autoAnalyzeStarted.current = true;
      router.replace(chatRequested ? "/dashboard?chat=1" : "/dashboard");
      void startAnalysis();
      return;
    }

    if (!hasCachedAnalysis) {
      setPhase("prompt");
    }
  }, [
    address,
    analyzeRequested,
    chatRequested,
    router,
    startAnalysis,
    walletData,
    isBooting,
    hasCachedAnalysis,
    sessionCache,
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

  if (phase === "boot" || isBooting) {
    return <DashboardBootLoading />;
  }

  if (phase === "prompt" && !isAnalyzing) {
    return (
      <AnalyzeWalletPrompt
        address={address}
        hasStoredAnalysis={hasCachedAnalysis}
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
      <Suspense fallback={<DashboardBootLoading />}>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </Suspense>
    </WalletDataProvider>
  );
}
