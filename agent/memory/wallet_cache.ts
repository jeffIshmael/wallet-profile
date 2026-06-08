interface CacheEntry {
  dataJson: string;
  timestamp: number;
}

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

class WalletCache {
  private cache = new Map<string, CacheEntry>();

  private getCacheKey(walletAddress: string, blockHeight?: number): string {
    const address = walletAddress.toLowerCase();
    const height = blockHeight || 18000000; // Mock current block height
    return `${address}:${height}`;
  }

  public get(walletAddress: string, blockHeight?: number): string | null {
    const key = this.getCacheKey(walletAddress, blockHeight);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > CACHE_TTL_MS) {
      console.log(`[WalletCache] Cache expired for key ${key}`);
      this.cache.delete(key);
      return null;
    }

    console.log(`[WalletCache] Cache hit for key ${key}`);
    return entry.dataJson;
  }

  public set(walletAddress: string, dataJson: string, blockHeight?: number): void {
    const key = this.getCacheKey(walletAddress, blockHeight);
    console.log(`[WalletCache] Writing to cache for key ${key}`);
    this.cache.set(key, {
      dataJson,
      timestamp: Date.now(),
    });
  }

  public clear(): void {
    this.cache.clear();
  }
}

export const walletCache = new WalletCache();
