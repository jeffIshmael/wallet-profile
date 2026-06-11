"use client";

import { useRouter } from "next/navigation";
import { Design4LandingPage } from "@/components/landing/design-4/Design4LandingPage";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { clearAnalysisSession } from "@/lib/dashboardSession";

export default function HomePage() {
  const router = useRouter();
  const { ready, authenticated, login, logout, address, connectingMiniPay } = useWalletAuth();

  function handleAnalyseWallet() {
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
