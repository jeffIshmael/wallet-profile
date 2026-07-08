"use client";

import { Copy, Wallet } from "lucide-react";
import { DashboardHeaderActions } from "@/components/layout/DashboardHeaderActions";
import { OnfraBrand } from "@/components/layout/OnfraBrand";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tooltip } from "@/components/ui/Tooltip";
import { ThemeToggleButton } from "@/providers/ThemeProvider";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useWalletDisplay } from "@/hooks/useWalletDisplay";

type HeaderProps = {
  compact?: boolean;
  dashboardActions?: { onChatOpen?: () => void };
};

export function Header({ compact = false, dashboardActions }: HeaderProps) {
  const { miniPay, connectingMiniPay } = useWalletAuth();
  const { primaryLabel, secondaryHint, address } = useWalletDisplay();
  const connecting = connectingMiniPay;

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div
        className={`relative mx-auto flex w-full items-center gap-2 px-4 sm:gap-4 sm:px-5 ${compact ? "h-12" : "h-14"}`}
      >
        <OnfraBrand size={compact ? "sm" : "md"} className="shrink-0" />

        {dashboardActions ? (
          <DashboardHeaderActions
            onChatOpen={dashboardActions.onChatOpen}
            trailing={
              <>
                {miniPay && <StatusBadge tone="green">MiniPay</StatusBadge>}
                <ThemeToggleButton />
              </>
            }
          />
        ) : (
          <>
            <div className="ml-auto flex items-center gap-1.5 rounded-full border border-white/10 bg-void-surface px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2">
              <Wallet size={14} className="shrink-0 text-btc-orange sm:hidden" />
              <Wallet size={15} className="hidden shrink-0 text-btc-orange sm:block" />
              <span className="hidden font-mono text-xs text-white sm:inline">
                {connecting ? "Connecting..." : primaryLabel}
              </span>
              <span className="font-mono text-[10px] text-white sm:hidden">
                {connecting ? "…" : primaryLabel}
              </span>
              {!miniPay && address && (
                <Tooltip label="Copy address">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(address)}
                    className="text-stardust hover:text-btc-orange"
                    aria-label="Copy wallet address"
                  >
                    <Copy size={13} />
                  </button>
                </Tooltip>
              )}
              {miniPay && secondaryHint && (
                <span className="hidden font-mono text-[10px] text-stardust sm:inline">{secondaryHint}</span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {miniPay && <StatusBadge tone="green">MiniPay</StatusBadge>}
              <ThemeToggleButton />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
