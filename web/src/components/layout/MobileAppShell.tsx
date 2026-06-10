"use client";

import { Suspense, type ReactNode } from "react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export const MOBILE_NAV_HEIGHT = "4.5rem";

function MobileBottomNavGate() {
  const { ready, authenticated } = useWalletAuth();

  if (!ready || !authenticated) return null;

  return <MobileBottomNav />;
}

type MobileAppShellProps = {
  children: ReactNode;
};

export function MobileAppShell({ children }: MobileAppShellProps) {
  const { ready, authenticated } = useWalletAuth();
  const showNav = ready && authenticated;

  return (
    <>
      <div
        className={showNav ? "pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0" : undefined}
      >
        {children}
      </div>
      <Suspense fallback={null}>
        <MobileBottomNavGate />
      </Suspense>
    </>
  );
}
