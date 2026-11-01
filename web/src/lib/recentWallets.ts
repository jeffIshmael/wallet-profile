const KEY = "onfra:recent-wallets";
const MAX = 8;

export type RecentWallet = { address: string; at: string };

export function getRecentWallets(): RecentWallet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is RecentWallet =>
        Boolean(item) && typeof item.address === "string" && typeof item.at === "string"
    );
  } catch {
    return [];
  }
}

export function addRecentWallet(address: string) {
  if (typeof window === "undefined") return;
  try {
    const normalized = address.toLowerCase();
    const next = [
      { address: normalized, at: new Date().toISOString() },
      ...getRecentWallets().filter((item) => item.address !== normalized)
    ].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: the list just won't persist */
  }
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}