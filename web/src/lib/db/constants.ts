/** Matches OnFRA agent wallet_cache TTL (15 minutes). */
export const ANALYSIS_CACHE_TTL_MS = 15 * 60 * 1000;

export function normalizeAddress(address: string) {
  return address.toLowerCase();
}
