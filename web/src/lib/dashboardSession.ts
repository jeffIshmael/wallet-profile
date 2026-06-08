export const ANALYSIS_DONE_KEY = "walletprofile-analysis-done";

export function hasCompletedAnalysis() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(ANALYSIS_DONE_KEY) === "1";
}

export function markAnalysisComplete() {
  sessionStorage.setItem(ANALYSIS_DONE_KEY, "1");
}

export function clearAnalysisSession() {
  sessionStorage.removeItem(ANALYSIS_DONE_KEY);
}
