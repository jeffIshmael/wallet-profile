"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Design4LandingPage } from "@/components/landing/design-4/Design4LandingPage";
import { useStoredAnalysis, type StoredAnalysisStatus } from "@/hooks/useStoredAnalysis";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { clearAnalysisSession } from "@/lib/dashboardSession";

export default function HomePage() {
  const router = useRouter();
  const { ready, authenticated, login, logout, address, connectingMiniPay, miniPay } = useWalletAuth();
  const storedStatus = useStoredAnalysis(ready ? address : null);

  useEffect(() => {
    if (!miniPay || !ready || !authenticated || !address) return;
    router.replace(storedStatus === "yes" ? "/dashboard" : "/dashboard?analyze=1");
  }, [miniPay, ready, authenticated, address, storedStatus, router]);

  function handleAnalyseWallet() {
    if (storedStatus === "yes") {
      router.push("/dashboard");
      return;
    }
    router.push("/dashboard?analyze=1");
  }

  function handleTryChat() {
    router.push("/chat");
  }

  return (
    <Design4LandingPage
      authenticated={ready && authenticated}
      address={ready ? address : null}
      connecting={connectingMiniPay}
      storedAnalysisStatus={storedStatus}
      onSignIn={login}
      onDisconnect={() => {
        clearAnalysisSession();
        logout();
      }}
      onAnalyseWallet={handleAnalyseWallet}
      onTryChat={handleTryChat}
    />
  );
}
