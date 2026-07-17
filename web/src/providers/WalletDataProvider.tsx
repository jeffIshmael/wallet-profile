"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import {
  clearAnalysisSession,
  loadWalletPayload,
  markAnalysisComplete,
  saveWalletData
} from "@/lib/dashboardSession";
import type { WalletData } from "@/types/walletData";
import { useWalletAuth } from "@/hooks/useWalletAuth";

/** Only background-refresh analysis when local snapshot is near expiry (matches server TTL). */
const ANALYSIS_STALE_MS = 14 * 60 * 1000;

type AnalyzeOptions = {
  force?: boolean;
  silent?: boolean;
};

type WalletDataContextValue = {
  walletData: WalletData | null;
  isAnalyzing: boolean;
  isHydrating: boolean;
  isRefreshing: boolean;
  lastFetchedAt: string | null;
  error: string | null;
  analyzeWallet: (walletAddress?: string, options?: AnalyzeOptions) => Promise<void>;
  refreshWallet: () => Promise<void>;
  loadStoredWallet: (walletAddress?: string) => Promise<boolean>;
  clearWallet: () => void;
};

const WalletDataContext = createContext<WalletDataContextValue | null>(null);

type StoredAnalysisRecord = {
  walletData: WalletData;
  fetchedAt: string;
};

async function fetchStoredAnalysisRecord(address: string): Promise<StoredAnalysisRecord | null> {
  try {
    const response = await fetch(`/api/wallet/${encodeURIComponent(address)}/analysis`);
    if (!response.ok) return null;
    const payload = (await response.json()) as {
      walletData?: WalletData | null;
      fetchedAt?: string;
    };
    if (!payload.walletData) return null;
    return {
      walletData: payload.walletData,
      fetchedAt: payload.fetchedAt ?? new Date().toISOString()
    };
  } catch {
    return null;
  }
}

export function WalletDataProvider({ children }: { children: ReactNode }) {
  const { address } = useWalletAuth();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const silentRefreshKey = useRef<string | null>(null);

  useEffect(() => {
    if (!address) {
      setWalletData(null);
      setLastFetchedAt(null);
      setIsHydrating(false);
      silentRefreshKey.current = null;
      return;
    }

    const normalized = address.toLowerCase();
    let cancelled = false;
    silentRefreshKey.current = null;
    setIsHydrating(true);

    async function hydrate() {
      const sessionPayload = loadWalletPayload(normalized);
      if (sessionPayload && !cancelled) {
        setWalletData(sessionPayload.data);
        setLastFetchedAt(sessionPayload.fetchedAt);
      }

      const stored = await fetchStoredAnalysisRecord(normalized);
      if (cancelled) return;

      if (stored) {
        setWalletData(stored.walletData);
        setLastFetchedAt(stored.fetchedAt);
        saveWalletData(normalized, stored.walletData, stored.fetchedAt);
        markAnalysisComplete();
      } else if (!sessionPayload) {
        setWalletData(null);
        setLastFetchedAt(null);
      }

      setIsHydrating(false);
    }

    void hydrate();

    // Prefetch onchain data while the user reads the dashboard prompt (same-server cache hit).
    void fetch("/api/agent/warm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress: normalized })
    }).catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [address]);

  const analyzeWallet = useCallback(
    async (walletAddress?: string, options?: AnalyzeOptions) => {
      const target = (walletAddress || address)?.toLowerCase();
      if (!target) {
        setError("Connect a wallet before analyzing.");
        return;
      }

      const silent = options?.silent ?? false;
      const force = options?.force ?? false;

      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsAnalyzing(true);
      }
      setError(null);

      try {
        const response = await fetch("/api/agent/analyze", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "x-onfra-dashboard": "true"
          },
          body: JSON.stringify({ walletAddress: target, callerAddress: address, force })
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Analysis failed.");
        }

        const payload = (await response.json()) as {
          walletData: WalletData;
          createdAt?: string;
        };
        const fetchedAt = payload.createdAt ?? new Date().toISOString();

        setWalletData(payload.walletData);
        setLastFetchedAt(fetchedAt);
        saveWalletData(target, payload.walletData, fetchedAt);
        markAnalysisComplete();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Analysis failed.";
        if (!silent) {
          setError(message);
          throw err;
        }
        console.warn("[WalletDataProvider] Silent refresh failed:", message);
      } finally {
        if (silent) {
          setIsRefreshing(false);
        } else {
          setIsAnalyzing(false);
        }
      }
    },
    [address]
  );

  const refreshWallet = useCallback(async () => {
    await analyzeWallet(undefined, { force: true });
  }, [analyzeWallet]);

  const loadStoredWallet = useCallback(
    async (walletAddress?: string) => {
      const target = (walletAddress || address)?.toLowerCase();
      if (!target) return false;

      const stored = await fetchStoredAnalysisRecord(target);
      if (!stored) return false;

      setWalletData(stored.walletData);
      setLastFetchedAt(stored.fetchedAt);
      saveWalletData(target, stored.walletData, stored.fetchedAt);
      markAnalysisComplete();
      return true;
    },
    [address]
  );

  useEffect(() => {
    if (!address || isHydrating || !walletData || !lastFetchedAt) return;

    const key = address.toLowerCase();
    if (silentRefreshKey.current === key) return;

    const ageMs = Date.now() - new Date(lastFetchedAt).getTime();
    if (ageMs < ANALYSIS_STALE_MS) return;

    silentRefreshKey.current = key;
    void analyzeWallet(key, { silent: true });
  }, [address, isHydrating, walletData, lastFetchedAt, analyzeWallet]);

  const clearWallet = useCallback(() => {
    setWalletData(null);
    setLastFetchedAt(null);
    setError(null);
    silentRefreshKey.current = null;
    clearAnalysisSession();
  }, []);

  const value = useMemo(
    () => ({
      walletData,
      isAnalyzing,
      isHydrating,
      isRefreshing,
      lastFetchedAt,
      error,
      analyzeWallet,
      refreshWallet,
      loadStoredWallet,
      clearWallet
    }),
    [
      walletData,
      isAnalyzing,
      isHydrating,
      isRefreshing,
      lastFetchedAt,
      error,
      analyzeWallet,
      refreshWallet,
      loadStoredWallet,
      clearWallet
    ]
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
