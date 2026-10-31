"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SignInScreen } from "@/components/auth/SignInScreen";
import { DashboardBootLoading } from "@/components/layout/DashboardBootLoading";
import { WalletAnalyzingScreen } from "@/components/layout/WalletAnalyzingScreen";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { isEvmAddress } from "@/lib/walletAddress";

/**
 * The landing page hands the pasted wallet over in the query string.
 * We accept a few common names so it works with whatever HeroWalletInput sends.
 */
const WALLET_PARAMS = ["wallet", "address", "w"];

/** Where the dashboard receives the wallet. Change this one line if your dashboard reads it differently. */
function dashboardHref(wallet: string) {
  return `/dashboard?wallet=${encodeURIComponent(wallet)}`;
}

function AppEntry() {
  const router = useRouter();
  const params = useSearchParams();
  const { ready, authenticated } = useWalletAuth();

  const rawParam =
    WALLET_PARAMS.map((key) => params.get(key)?.trim()).find(Boolean) ?? "";
  const paramIsValid = isEvmAddress(rawParam);

  const [typedWallet, setTypedWallet] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Wallet to analyze: one typed on this page wins, then one from the landing page.
  const walletToAnalyze =
    typedWallet ?? (paramIsValid && !dismissed ? rawParam : null);

  // Signed-in visitors with no wallet to analyze go straight to their dashboard.
  useEffect(() => {
    if (ready && authenticated && !walletToAnalyze) {
      router.replace("/dashboard");
    }
  }, [ready, authenticated, walletToAnalyze, router]);

  const handleDone = useCallback(() => {
    if (walletToAnalyze) router.replace(dashboardHref(walletToAnalyze));
  }, [walletToAnalyze, router]);

  const handleCancel = useCallback(() => {
    setTypedWallet(null);
    setDismissed(true);
    router.replace("/");
  }, [router]);

  if (walletToAnalyze) {
    return (
      <WalletAnalyzingScreen
        wallet={walletToAnalyze}
        onDone={handleDone}
        onCancel={handleCancel}
      />
    );
  }

  if (ready && authenticated) {
    return <DashboardBootLoading />;
  }

  const badParam = rawParam !== "" && !paramIsValid;

  return (
    <SignInScreen
      onAnalyze={setTypedWallet}
      initialWallet={badParam ? rawParam : ""}
      initialError={
        badParam
          ? "That doesn’t look like a valid Celo wallet address. Check it and try again."
          : ""
      }
    />
  );
}

export default function AppEntryPage() {
  // useSearchParams needs a Suspense boundary in the App Router
  return (
    // @ts-expect-error Suspense type incompatibility between React 18 and Next.js
    <Suspense fallback={<div className="entry-bg min-h-screen" />}>
      <AppEntry />
    </Suspense>
  );
}