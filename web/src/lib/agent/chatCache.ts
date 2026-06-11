import type { WalletData } from "@/types/walletData";
import { getLatestAnalysisRun } from "@/lib/db/analysis";

/** Latest dashboard snapshot for chat — uses expired cache too (own-wallet fast path). */
export async function getWalletDataForChat(
  walletAddress: string
): Promise<{ walletData: WalletData; stale: boolean } | null> {
  const run = await getLatestAnalysisRun(walletAddress);
  if (!run?.walletData) return null;

  return {
    walletData: run.walletData as WalletData,
    stale: run.expiresAt <= new Date()
  };
}
