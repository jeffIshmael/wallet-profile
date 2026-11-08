"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { DashboardBootLoading } from "@/components/layout/DashboardBootLoading";
import { WalletAnalyzingScreen } from "@/components/layout/WalletAnalyzingScreen";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useStoredAnalysis } from "@/hooks/useStoredAnalysis";
import { useWalletData } from "@/hooks/useWalletData";
import { hasCompletedAnalysis, loadWalletPayload } from "@/lib/dashboardSession";
import { isEvmAddress } from "@/lib/walletAddress";
import { WalletDataProvider } from "@/providers/WalletDataProvider";

type DashboardPhase = "boot" | "analyzing" | "error" | "ready";

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatRequested = searchParams.get("chat") === "1";
  const analyzeParam = searchParams.get("analyze");

  // ?address=0x… or ?wallet=0x… lets a visitor view any public wallet (guest mode)
  const WALLET_PARAMS = ["address", "wallet", "w"];
  const rawAddressParam =
    WALLET_PARAMS.map((key) => searchParams.get(key)?.trim()).find(Boolean) ?? "";
  const addressParam = isEvmAddress(rawAddressParam) ? rawAddressParam : null;

  const { ready, authenticated, address: ownAddress } = useWalletAuth();
  const subject = addressParam ?? ownAddress ?? null; // the wallet we are analyzing
  const isGuest = !authenticated;

  const sessionCache = subject ? loadWalletPayload(subject) : null;
  const storedStatus = useStoredAnalysis(subject);
  const { analyzeWallet, walletData, isHydrating, loadStoredWallet } = useWalletData();

  // Loaded data only counts if it belongs to the wallet we are viewing
  const dataMatches = Boolean(
    walletData && subject && walletData.walletAddress?.toLowerCase() === subject.toLowerCase()
  );

  const [phase, setPhase] = useState<DashboardPhase>("boot");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const autoAnalyzeStarted = useRef(false);
  const autoLoadStarted = useRef(false);
  const subjectRef = useRef(subject);
  subjectRef.current = subject;
  const analyzingRef = useRef(false); // true while the analyzing/error screen owns the page

  const cleanUrl = useCallback(() => {
    const qs = new URLSearchParams();
    if (addressParam) qs.set("address", addressParam);
    if (chatRequested) qs.set("chat", "1");
    const s = qs.toString();
    return s ? `/dashboard?${s}` : "/dashboard";
  }, [addressParam, chatRequested]);

  // Not signed in and no wallet to view: back to the entry page
  useEffect(() => {
    if (ready && !authenticated && !addressParam) {
      router.replace("/");
    }
  }, [ready, authenticated, addressParam, router]);

  // The wallet being viewed changed: start over
  useEffect(() => {
    autoAnalyzeStarted.current = false;
    autoLoadStarted.current = false;
    analyzingRef.current = false;
    setPhase("boot");
  }, [subject]);

  // Drop the legacy ?analyze=1 flag
  useEffect(() => {
    if (analyzeParam) router.replace(cleanUrl());
  }, [analyzeParam, cleanUrl, router]);

  const hasCachedAnalysis =
    Boolean(dataMatches || sessionCache) ||
    storedStatus === "yes" ||
    (subject ? hasCompletedAnalysis() : false);

  const isBooting =
    Boolean(subject) &&
    (isHydrating || (storedStatus === "unknown" && !sessionCache && !dataMatches));

  const startAnalysis = useCallback(async () => {
    if (!subject) return;
    const target = subject;
    analyzingRef.current = true;
    setAttempt((n) => n + 1);
    setAnalysisDone(false);
    setErrorMessage("");
    setPhase("analyzing");
    try {
      await analyzeWallet(target);
      if (subjectRef.current !== target) return; // wallet changed while we waited
      setAnalysisDone(true); // the screen finishes its steps, then calls onDone
    } catch (err) {
      if (subjectRef.current !== target) return;
      setErrorMessage(err instanceof Error ? err.message.slice(0, 180) : "");
      setPhase("error"); // analyzingRef stays true so the effect below leaves it alone
    }
  }, [subject, analyzeWallet]);

  const handleAnimationDone = useCallback(() => {
    analyzingRef.current = false;
    setPhase("ready");
  }, []);

  useEffect(() => {
    if (analyzingRef.current) return;

    if (!subject) {
      setPhase("boot");
      return;
    }

    if (isBooting) {
      setPhase("boot");
      return;
    }

    if (dataMatches) {
      setPhase("ready");
      return;
    }

    if (hasCachedAnalysis && !autoLoadStarted.current) {
      autoLoadStarted.current = true;
      setPhase("boot");
      const target = subject;
      void loadStoredWallet(target).then((loaded) => {
        if (subjectRef.current !== target) return; // wallet changed while loading
        if (loaded) {
          setPhase("ready");
        } else {
          autoAnalyzeStarted.current = true;
          void startAnalysis();
        }
      });
      return;
    }

    // First time for this wallet: analyze automatically (no prompt screen)
    if (!hasCachedAnalysis && !autoAnalyzeStarted.current) {
      autoAnalyzeStarted.current = true;
      void startAnalysis();
    }
  }, [
    subject,
    isBooting,
    dataMatches,
    hasCachedAnalysis,
    loadStoredWallet,
    startAnalysis
  ]);

  // Safety net: if we sit on the boot screen too long, stop waiting and analyze
  const startRef = useRef(startAnalysis);
  startRef.current = startAnalysis;
  useEffect(() => {
    if (phase !== "boot" || !subject) return;
    const timer = window.setTimeout(() => {
      analyzingRef.current = false; // we are on the boot screen, so nothing else is working
      autoAnalyzeStarted.current = true;
      void startRef.current();
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [phase, subject]);

  if (!ready) return null;
  if (!authenticated && !addressParam) return null; // redirecting to "/"

  if (phase === "analyzing" || phase === "error") {
    return (
      <WalletAnalyzingScreen
        key={attempt}
        wallet={subject ?? undefined}
        ready={analysisDone}
        error={
          phase === "error"
            ? errorMessage ||
              "Something went wrong while reading this wallet. Check your connection and try again."
            : null
        }
        onDone={handleAnimationDone}
        onRetry={() => void startAnalysis()}
        onCancel={isGuest ? () => router.replace("/") : undefined}
      />
    );
  }

  if (phase === "boot") {
    return <DashboardBootLoading />;
  }

  return children;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <WalletDataProvider>
      {/* @ts-expect-error Suspense type incompatibility between React 18 and Next.js */}
      <Suspense fallback={null}>
        <DashboardLayoutInner>{children}</DashboardLayoutInner>
      </Suspense>
    </WalletDataProvider>
  );
}