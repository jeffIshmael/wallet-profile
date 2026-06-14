"use client";

import { Suspense, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export const MOBILE_NAV_HEIGHT = "4.5rem";

const HIDE_MOBILE_NAV_PATHS = ["/chat"];

function MobileBottomNavGate() {
  const pathname = usePathname();
  const { ready, authenticated } = useWalletAuth();

  if (!ready || !authenticated || HIDE_MOBILE_NAV_PATHS.includes(pathname)) return null;

  return <MobileBottomNav />;
}

type MobileAppShellProps = {
  children: ReactNode;
};

export function MobileAppShell({ children }: MobileAppShellProps) {
  const pathname = usePathname();
  const { ready, authenticated } = useWalletAuth();
  const showNav = ready && authenticated && !HIDE_MOBILE_NAV_PATHS.includes(pathname);

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
