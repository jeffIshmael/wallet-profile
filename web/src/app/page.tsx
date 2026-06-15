"use client";

import { useRouter } from "next/navigation";
import { Design4LandingPage } from "@/components/landing/design-4/Design4LandingPage";
import { useStoredAnalysis } from "@/hooks/useStoredAnalysis";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { clearAnalysisSession } from "@/lib/dashboardSession";

export default function HomePage() {
  const router = useRouter();
  const { ready, authenticated, login, logout, address, connectingMiniPay } = useWalletAuth();
  const storedStatus = useStoredAnalysis(ready ? address : null);

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
