"use client";

import { HeroSection } from "@/components/landing/design-4/hero/HeroSection";
import { HowItWorksSection } from "@/components/landing/design-4/sections/HowItWorksSection";
import { ProblemSection } from "@/components/landing/design-4/sections/ProblemSection";
import { ReportContentsSection } from "@/components/landing/design-4/sections/ReportContentsSection";
import { FooterSection } from "@/components/landing/design-4/sections/FooterSection";
import { SolutionSection } from "@/components/landing/design-4/sections/SolutionSection";
import { SupportedChainsSection } from "@/components/landing/design-4/sections/SupportedChainsSection";
import { UsersSection } from "@/components/landing/design-4/sections/UsersSection";
type Design4LandingPageProps = {
  authenticated: boolean;
  address: string | null;
  onSignIn: () => void;
  onAnalyseWallet: () => void;
  onTryChat: () => void;
};

export function Design4LandingPage({
  authenticated,
  address,
  onSignIn,
  onAnalyseWallet,
  onTryChat
}: Design4LandingPageProps) {
  function handleAnalyze() {
    if (!authenticated) {
      onSignIn();
      return;
    }
    onAnalyseWallet();
  }

  return (
    <div className="min-h-screen bg-void font-inter text-white">
      <HeroSection
        onSignIn={onSignIn}
        onAnalyze={handleAnalyze}
        onTryChat={onTryChat}
        authenticated={authenticated}
        address={address}
      />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <SupportedChainsSection />
      <ReportContentsSection />
      <UsersSection />
      <FooterSection />
    </div>
  );
}
