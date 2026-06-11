"use client";

import { useEffect, useState } from "react";

export type StoredAnalysisStatus = "unknown" | "yes" | "no";

export function useStoredAnalysis(address: string | null | undefined): StoredAnalysisStatus {
  const [status, setStatus] = useState<StoredAnalysisStatus>("unknown");

  useEffect(() => {
    if (!address) {
      setStatus("no");
      return;
    }

    let cancelled = false;
    setStatus("unknown");

    void fetch(`/api/wallet/${encodeURIComponent(address.toLowerCase())}/analysis`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: { walletData?: unknown } | null) => {
        if (cancelled) return;
        setStatus(payload?.walletData ? "yes" : "no");
      })
      .catch(() => {
        if (!cancelled) setStatus("no");
      });

    return () => {
      cancelled = true;
    };
  }, [address]);

  return status;
}
