"use client";

import { RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { useWalletData } from "@/hooks/useWalletData";

function formatLastAnalysed(iso: string) {
  const date = new Date(iso);
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "long" });
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day} ${month} ${year} ${hours}${minutes}`;
}

type DashboardRefreshAnalysisProps = {
  compact?: boolean;
};

export function DashboardRefreshAnalysis({ compact = false }: DashboardRefreshAnalysisProps) {
  const { lastFetchedAt, isAnalyzing, isRefreshing, refreshWallet } = useWalletData();
  const busy = isAnalyzing || isRefreshing;

  const title = lastFetchedAt
    ? `Last analysed ${formatLastAnalysed(lastFetchedAt)}`
    : "Refresh wallet analysis";

  return (
    <button
      type="button"
      onClick={() => void refreshWallet()}
      disabled={busy}
      title={title}
      className={clsx(
        "inline-flex flex-col items-center rounded-lg border border-white/10 font-semibold text-stardust transition hover:border-btc-orange/40 hover:text-white disabled:cursor-wait disabled:opacity-50",
        compact ? "w-full justify-center px-3 py-2" : "shrink-0 px-3 py-1"
      )}
    >
      <span
        className={clsx(
          "inline-flex items-center gap-1.5",
          compact ? "text-[10px]" : "text-[11px]"
        )}
      >
        <RefreshCw size={12} className={clsx("shrink-0", busy && "animate-spin")} />
        {busy ? (isAnalyzing ? "Refreshing..." : "Updating...") : "Refresh analysis"}
      </span>
      {!busy && lastFetchedAt && (
        <span
          className={clsx(
            "hidden font-normal text-stardust/70 lg:inline",
            compact ? "text-[9px]" : "text-[10px]"
          )}
        >
          Lastly: {formatLastAnalysed(lastFetchedAt)}
        </span>
      )}
    </button>
  );
}
