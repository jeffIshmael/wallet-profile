"use client";

import { useRouter } from "next/navigation";
import { LandingNav } from "@/components/landing/design-4/LandingNav";
import { FooterSection } from "@/components/landing/design-4/sections/FooterSection";
import { VerifySection } from "@/components/landing/design-4/sections/VerifySection";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export default function VerifyPage() {
  const router = useRouter();
  const { ready, authenticated, login, logout, address, connectingMiniPay } = useWalletAuth();

  function handleTryChat() {
    if (!authenticated) {
      login();
      return;
    }
    router.push("/dashboard?chat=1");
  }

  return (
    <div className="min-h-screen bg-void font-inter text-white">
      <LandingNav
        onSignIn={login}
        onDisconnect={logout}
        onTryChat={handleTryChat}
        authenticated={ready && authenticated}
        address={ready ? address : null}
        connecting={connectingMiniPay}
        active="verify"
      />
      <main className="pt-24">
        <VerifySection />
      </main>
      <FooterSection />
    </div>
  );
}
