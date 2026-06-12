"use client";

import { useRouter } from "next/navigation";
import { LandingNav } from "@/components/landing/design-4/LandingNav";
import { FooterSection } from "@/components/landing/design-4/sections/FooterSection";
import { StatsContent } from "@/components/stats/StatsContent";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { clearAnalysisSession } from "@/lib/dashboardSession";

export default function StatsPage() {
  const router = useRouter();
  const { ready, authenticated, login, logout, address, connectingMiniPay } = useWalletAuth();

  function handleTryChat() {
    router.push("/chat");
  }

  return (
    <div className="flex min-h-screen flex-col bg-void font-inter text-white">
      <LandingNav
        onSignIn={login}
        onDisconnect={() => {
          clearAnalysisSession();
          logout();
        }}
        onTryChat={handleTryChat}
        authenticated={ready && authenticated}
        address={ready ? address : null}
        connecting={connectingMiniPay || !ready}
        active="stats"
      />
      <main className="flex flex-1 flex-col pt-24">
        <StatsContent />
      </main>
      <FooterSection />
    </div>
  );
}
