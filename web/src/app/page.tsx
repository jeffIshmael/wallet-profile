"use client";

import { useRouter } from "next/navigation";
import { Design4LandingPage } from "@/components/landing/design-4/Design4LandingPage";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export default function HomePage() {
  const router = useRouter();
  const { ready, authenticated, login, address } = useWalletAuth();

  function handleAnalyseWallet() {
    router.push("/dashboard");
  }

  function handleTryChat() {
    if (!authenticated) {
      login();
      return;
    }
    router.push("/dashboard?chat=1");
  }

  return (
    <Design4LandingPage
      authenticated={ready && authenticated}
      address={ready ? address : null}
      onSignIn={login}
      onAnalyseWallet={handleAnalyseWallet}
      onTryChat={handleTryChat}
    />
  );
}
