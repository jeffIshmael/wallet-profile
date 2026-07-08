"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignInScreen } from "@/components/auth/SignInScreen";
import { DashboardBootLoading } from "@/components/layout/DashboardBootLoading";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export default function AppEntryPage() {
  const router = useRouter();
  const { ready, authenticated } = useWalletAuth();

  useEffect(() => {
    if (ready && authenticated) {
      router.replace("/dashboard");
    }
  }, [ready, authenticated, router]);

  if (ready && authenticated) {
    return <DashboardBootLoading />;
  }

  return <SignInScreen />;
}
