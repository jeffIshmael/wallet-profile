"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AgentChatPreviewClaude } from "@/components/chat/AgentChatPreviewClaude";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { LandingNav } from "@/components/landing/design-4/LandingNav";
import { FooterSection } from "@/components/landing/design-4/sections/FooterSection";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { clearAnalysisSession } from "@/lib/dashboardSession";

function useIsMobileSignedInChat() {
  const [showMobileChat, setShowMobileChat] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    function update() {
      setShowMobileChat(media.matches);
    }

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return showMobileChat;
}

export function AgentChatPage() {
  const router = useRouter();
  const { ready, authenticated, login, logout, address, connectingMiniPay } = useWalletAuth();
  const isMobile = useIsMobileSignedInChat();
  const showSignedInMobileChat = ready && authenticated && isMobile;

  function handleAskAgent() {
    if (!authenticated || !address) {
      login();
      return;
    }
    if (isMobile) return;
    router.push("/dashboard?chat=1");
  }

  if (showSignedInMobileChat) {
    return (
      <div className="flex h-[calc(100dvh-4.5rem-env(safe-area-inset-bottom,0px))] flex-col bg-void font-inter text-white md:hidden">
        <ChatSidebar fullPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void font-inter text-white">
      <LandingNav
        onSignIn={login}
        onDisconnect={() => {
          clearAnalysisSession();
          logout();
        }}
        onTryChat={() => {
          if (!authenticated || !address) {
            login();
            return;
          }
          if (isMobile) return;
          router.push("/dashboard?chat=1");
        }}
        authenticated={ready && authenticated}
        address={ready ? address : null}
        connecting={connectingMiniPay}
      />
      <main className="pt-20">
        <AgentChatPreviewClaude
          authenticated={ready && authenticated}
          onAskAgent={handleAskAgent}
          onSignIn={login}
          connecting={connectingMiniPay}
        />
      </main>
      <FooterSection />
    </div>
  );
}
