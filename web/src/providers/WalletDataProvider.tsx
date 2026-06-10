"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  clearAnalysisSession,
  loadWalletData,
  markAnalysisComplete,
  saveWalletData
} from "@/lib/dashboardSession";
import type { WalletData } from "@/types/walletData";
import { useWalletAuth } from "@/hooks/useWalletAuth";

type WalletDataContextValue = {
  walletData: WalletData | null;
  isAnalyzing: boolean;
  error: string | null;
  analyzeWallet: (walletAddress?: string) => Promise<void>;
  clearWallet: () => void;
};

const WalletDataContext = createContext<WalletDataContextValue | null>(null);

export function WalletDataProvider({ children }: { children: ReactNode }) {
  const { address } = useWalletAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setWalletData(null);
      return;
    }
    const cached = loadWalletData(address);
    if (cached) setWalletData(cached);
  }, [address]);

  const analyzeWallet = useCallback(
    async (walletAddress?: string) => {
      const target = (walletAddress || address)?.toLowerCase();
      if (!target) {
        setError("Connect a wallet before analyzing.");
        return;
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const response = await fetch("/api/agent/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress: target })
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Analysis failed.");
        }

        const payload = (await response.json()) as { walletData: WalletData };
        setWalletData(payload.walletData);
        saveWalletData(target, payload.walletData);
        markAnalysisComplete();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed.";
        setError(message);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [address]
  );

  const clearWallet = useCallback(() => {
    setWalletData(null);
    setError(null);
    clearAnalysisSession();
  }, []);

  const value = useMemo(
    () => ({
      walletData,
      isAnalyzing,
      error,
      analyzeWallet,
      clearWallet
    }),
    [walletData, isAnalyzing, error, analyzeWallet, clearWallet]
  );

  return <WalletDataContext.Provider value={value}>{children}</WalletDataContext.Provider>;
}

export function useWalletData() {
  const context = useContext(WalletDataContext);
  if (!context) {
    throw new Error("useWalletData must be used within WalletDataProvider");
  }
  return context;
}
