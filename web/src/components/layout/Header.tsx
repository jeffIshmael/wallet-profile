"use client";

import { Copy, ExternalLink, Wallet } from "lucide-react";
import { DashboardHeaderActions } from "@/components/layout/DashboardHeaderActions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tooltip } from "@/components/ui/Tooltip";
import { ThemeToggleButton } from "@/providers/ThemeProvider";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { truncateAddress } from "@/lib/format";

type HeaderProps = {
  compact?: boolean;
  dashboardActions?: { onChatOpen?: () => void };
};

export function Header({ compact = false, dashboardActions }: HeaderProps) {
  const { address: authAddress, miniPay, connectingMiniPay } = useWalletAuth();
  const address = authAddress ?? "";
  const connecting = connectingMiniPay;

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className={`mx-auto flex w-full items-center gap-2 px-4 sm:gap-3 sm:px-5 ${compact ? "h-12" : "h-14 max-w-6xl"}`}>
        <div className="flex min-w-0 shrink-0 items-center">
          <span className={`font-dancing text-white ${compact ? "text-lg" : "text-xl md:text-2xl"}`}>
            Wallet<span className="text-btc-orange">Profile</span>
          </span>
        </div>

        {dashboardActions && (
          <div className="ml-auto flex min-w-0 items-center gap-2 sm:ml-0 sm:flex-1 sm:justify-end">
            <DashboardHeaderActions onChatOpen={dashboardActions.onChatOpen} />
          </div>
        )}

        <div
          className={`flex items-center gap-1.5 rounded-full border border-white/10 bg-void-surface px-2.5 py-1.5 sm:gap-2 sm:px-3 sm:py-2 ${dashboardActions ? "" : "ml-auto"}`}
        >
          <Wallet size={14} className="shrink-0 text-btc-orange sm:hidden" />
          <Wallet size={15} className="hidden shrink-0 text-btc-orange sm:block" />
          <span className="hidden font-mono text-xs text-white sm:inline">
            {connecting ? "Connecting..." : truncateAddress(address)}
          </span>
          <span className="font-mono text-[10px] text-white sm:hidden">{truncateAddress(address, 4, 3)}</span>
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

        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {miniPay && <StatusBadge tone="green">MiniPay</StatusBadge>}
          <ThemeToggleButton />
        </div>
      </div>
    </header>
  );
}
