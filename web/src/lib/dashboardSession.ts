import type { WalletData } from "@/types/walletData";

export const ANALYSIS_DONE_KEY = "walletprofile-analysis-done";
export const WALLET_DATA_KEY = "walletprofile-wallet-data";

type StoredWalletPayload = {
  address: string;
  data: WalletData;
  fetchedAt: string;
};

export function hasCompletedAnalysis() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ANALYSIS_DONE_KEY) === "1";
}

export function markAnalysisComplete() {
  sessionStorage.setItem(ANALYSIS_DONE_KEY, "1");
}

export function clearAnalysisSession() {
  sessionStorage.removeItem(ANALYSIS_DONE_KEY);
  sessionStorage.removeItem(WALLET_DATA_KEY);
}

export function saveWalletData(address: string, data: WalletData, fetchedAt?: string) {
  const payload: StoredWalletPayload = {
    address: address.toLowerCase(),
    data,
    fetchedAt: fetchedAt ?? new Date().toISOString()
  };
  sessionStorage.setItem(WALLET_DATA_KEY, JSON.stringify(payload));
}

export function loadWalletPayload(address: string): StoredWalletPayload | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(WALLET_DATA_KEY);
  if (!raw) return null;
  try {
    const payload = JSON.parse(raw) as StoredWalletPayload;
    if (payload.address !== address.toLowerCase()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function loadWalletData(address: string): WalletData | null {
  return loadWalletPayload(address)?.data ?? null;
}
