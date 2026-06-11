import { createPublicClient, http, formatUnits } from 'viem'
import { mainnet, celo, base } from 'viem/chains'

export const publicClient = createPublicClient({ 
  chain: celo,
  transport: http()
})

export const mainnetClient = createPublicClient({
  chain: mainnet,
  transport: http()
})

export const baseClient = createPublicClient({
  chain: base,
  transport: http()
})

const erc20Abi = [
  {
    stateMutability: 'view',
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  }
] as const;

// Stablecoin mappings from localStablecoin.md
export interface StablecoinInfo {
  symbol: string;
  name: string;
  address: `0x${string}`;
  decimals: number;
  usdRate: number;
}

export const STABLECOINS: Record<string, StablecoinInfo> = {
  "0x765de816845861e75a25fca122bb6898b8b1282a": { symbol: "cUSD", name: "Mento Dollar", address: "0x765de816845861e75a25fca122bb6898b8b1282a", decimals: 18, usdRate: 1.0 },
  "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73": { symbol: "cEUR", name: "Mento Euro", address: "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73", decimals: 18, usdRate: 1.08 },
  "0xe8537a3d056da446677b9e9d6c5db704eaab4787": { symbol: "cREAL", name: "Mento Brazilian Real", address: "0xe8537a3d056da446677b9e9d6c5db704eaab4787", decimals: 18, usdRate: 0.18 },
  "0x73f93dcc49cb8a239e2032663e9475dd5ef29a08": { symbol: "XOFm", name: "Mento West African CFA Franc", address: "0x73f93dcc49cb8a239e2032663e9475dd5ef29a08", decimals: 18, usdRate: 0.0016 },
  "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0": { symbol: "KESm", name: "Mento Kenyan Shilling", address: "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0", decimals: 18, usdRate: 0.0076 },
  "0x105d4a9306d2e55a71d2eb95b81553ae1dc20d7b": { symbol: "PHPm", name: "Mento Philippine Peso", address: "0x105d4a9306d2e55a71d2eb95b81553ae1dc20d7b", decimals: 18, usdRate: 0.017 },
  "0x8a567e2ae79ca692bd748ab832081c45de4041ea": { symbol: "COPm", name: "Mento Colombian Peso", address: "0x8a567e2ae79ca692bd748ab832081c45de4041ea", decimals: 18, usdRate: 0.00025 },
  "0xccf663b1ff11028f0b19058d0f7b674004a40746": { symbol: "GBPm", name: "Mento British Pound", address: "0xccf663b1ff11028f0b19058d0f7b674004a40746", decimals: 18, usdRate: 1.27 },
  "0xff4ab19391af240c311c54200a492233052b6325": { symbol: "CADm", name: "Mento Canadian Dollar", address: "0xff4ab19391af240c311c54200a492233052b6325", decimals: 18, usdRate: 0.73 },
  "0x7175504c455076f15c04a2f90a8e352281f492f9": { symbol: "AUDm", name: "Mento Australian Dollar", address: "0x7175504c455076f15c04a2f90a8e352281f492f9", decimals: 18, usdRate: 0.66 },
  "0x4c35853a3b4e647fd266f4de678dcc8fec410bf6": { symbol: "ZARm", name: "Mento South African Rand", address: "0x4c35853a3b4e647fd266f4de678dcc8fec410bf6", decimals: 18, usdRate: 0.054 },
  "0xfaea5f3404bba20d3cc2f8c4b0a888f55a3c7313": { symbol: "GHSm", name: "Mento Ghanaian Cedi", address: "0xfaea5f3404bba20d3cc2f8c4b0a888f55a3c7313", decimals: 18, usdRate: 0.068 },
  "0xe2702bd97ee33c88c8f6f92da3b733608aa76f71": { symbol: "NGNm", name: "Mento Nigerian Naira", address: "0xe2702bd97ee33c88c8f6f92da3b733608aa76f71", decimals: 18, usdRate: 0.00067 },
  "0xc45ecf20f3cd864b32d9794d6f76814ae8892e20": { symbol: "JPYm", name: "Mento Japanese Yen", address: "0xc45ecf20f3cd864b32d9794d6f76814ae8892e20", decimals: 18, usdRate: 0.0064 },
  "0xb55a79f398e759e43c95b979163f30ec87ee131d": { symbol: "CHFm", name: "Mento Swiss Franc", address: "0xb55a79f398e759e43c95b979163f30ec87ee131d", decimals: 18, usdRate: 1.11 },
  "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e": { symbol: "USDT", name: "Tether USD", address: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e", decimals: 6, usdRate: 1.0 },
  "0xceba9300f2b948710d2653dd7b07f33a8b32118c": { symbol: "USDC", name: "USD Coin", address: "0xceba9300f2b948710d2653dd7b07f33a8b32118c", decimals: 6, usdRate: 1.0 },
  "0x9346f43c1588b6df1d52bdd6bf846064f92d9cba": { symbol: "vEUR", name: "VNX Euro", address: "0x9346f43c1588b6df1d52bdd6bf846064f92d9cba", decimals: 18, usdRate: 1.08 },
  "0x7ae4265ecfc1f31bc0e112dfcfe3d78e01f4bb7f": { symbol: "vGBP", name: "VNX British Pound", address: "0x7ae4265ecfc1f31bc0e112dfcfe3d78e01f4bb7f", decimals: 18, usdRate: 1.27 },
  "0xc5ebea9984c485ec5d58ca5a2d376620d93af871": { symbol: "vCHF", name: "VNX Swiss Franc", address: "0xc5ebea9984c485ec5d58ca5a2d376620d93af871", decimals: 18, usdRate: 1.11 },
  "0x59d9356e565ab3a36dd77763fc0d87feaf85508c": { symbol: "USDM", name: "Mountain Protocol USDM", address: "0x59d9356e565ab3a36dd77763fc0d87feaf85508c", decimals: 18, usdRate: 1.0 },
  "0x0000206329b97db379d5e1bf586bbdb969c63274": { symbol: "USDA", name: "Angle USDA", address: "0x0000206329b97db379d5e1bf586bbdb969c63274", decimals: 18, usdRate: 1.0 },
  "0xc16b81af351ba9e64c1a069e3ab18c244a1e3049": { symbol: "EURA", name: "Angle EURA", address: "0xc16b81af351ba9e64c1a069e3ab18c244a1e3049", decimals: 18, usdRate: 1.08 },
  "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3": { symbol: "USDGLO", name: "Glo Dollar", address: "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3", decimals: 18, usdRate: 1.0 },
  "0xfecb3f7c54e2caae9dc6ac9060a822d47e053760": { symbol: "BRLA", name: "BRLA Digital", address: "0xfecb3f7c54e2caae9dc6ac9060a822d47e053760", decimals: 18, usdRate: 0.18 },
  "0xc92e8fc2947e32f2b574cca9f2f12097a71d5606": { symbol: "COPM", name: "Minteo Colombian Peso", address: "0xc92e8fc2947e32f2b574cca9f2f12097a71d5606", decimals: 18, usdRate: 0.00025 },
  "0x62b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a": { symbol: "G$", name: "GoodDollar", address: "0x62b8b11039fcfe5ab0c56e502b1c372a3d2a9c7a", decimals: 18, usdRate: 0.0001 }
};

const DATA_CACHE_TTL_MS = 15 * 60 * 1000;
const CELO_PRICE_TTL_MS = 5 * 60 * 1000;
const MAX_DISCOVERED_TOKENS = 24;
const DEFAULT_FETCH_TIMEOUT_MS = 20_000;

type CacheEntry<T> = { data: T; timestamp: number };

async function fetchJsonWithTimeout(url: string, timeoutMs = DEFAULT_FETCH_TIMEOUT_MS): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/** Fetch and cache transaction history only — skips balances, ENS, NFT, etc. */
export async function cacheWalletTransactions(
  address: string,
  months = 3
): Promise<TransactionDetails[]> {
  const key = address.toLowerCase();
  const cached = fullOnchainDataCache.get(key);
  if (cached?.transactions?.length) {
    return filterTransactionsByMonths(cached.transactions, months);
  }

  const celoPrice = cached?.celoPrice ?? (await getCeloPrice());
  const transactions = await getWalletTransactions(key, celoPrice, months);
  fullOnchainDataCache.set(key, { ...cached, walletAddress: key, transactions, celoPrice });
  return transactions;
}

/** Fetch balances + NFT exposure only — for risk/loan tools without full wallet scan. */
export async function cachePortfolioSnapshot(address: string) {
  const key = address.toLowerCase();
  const cached = fullOnchainDataCache.get(key);
  if (
    cached?.stablecoinBalance !== undefined &&
    cached?.volatileBalance !== undefined &&
    cached?.defiExposure !== undefined &&
    cached?.nftCount !== undefined
  ) {
    return {
      walletAddress: key,
      stablecoinBalance: cached.stablecoinBalance,
      volatileBalance: cached.volatileBalance,
      defiExposure: cached.defiExposure,
      nftExposure: cached.nftExposure ?? 0,
      nftCount: cached.nftCount ?? 0,
      celoPrice: cached.celoPrice ?? (await getCeloPrice())
    };
  }

  const [balances, nft] = await Promise.all([getWalletBalances(key), getNftExposure(key)]);
  const snapshot = {
    walletAddress: key,
    stablecoinBalance: balances.stablecoinBalance,
    volatileBalance: balances.volatileBalance,
    defiExposure: balances.defiExposure,
    nftExposure: nft.nftExposure,
    nftCount: nft.nftCount,
    celoPrice: balances.celoPrice
  };
  fullOnchainDataCache.set(key, { ...cached, ...snapshot });
  return snapshot;
}

const celoPriceCache: CacheEntry<number> = { data: 0, timestamp: 0 };
const balanceCache = new Map<string, CacheEntry<Awaited<ReturnType<typeof fetchWalletBalancesUncached>>>>();
const transactionCache = new Map<string, CacheEntry<TransactionDetails[]>>();
const nftCache = new Map<string, CacheEntry<{ nftExposure: number; nftCount: number }>>();
const inFlight = new Map<string, Promise<unknown>>();

function isFresh<T>(entry: CacheEntry<T> | undefined, ttlMs: number): entry is CacheEntry<T> {
  return !!entry && Date.now() - entry.timestamp < ttlMs;
}

async function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const pending = inFlight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = fn().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

function filterTransactionsByMonths(transactions: TransactionDetails[], months: number): TransactionDetails[] {
  const cutoffMs = Date.now() - months * 30 * 24 * 60 * 60 * 1000;
  return transactions.filter((tx) => new Date(tx.timestamp).getTime() >= cutoffMs);
}

export async function getCeloPrice(): Promise<number> {
  if (Date.now() - celoPriceCache.timestamp < CELO_PRICE_TTL_MS) {
    return celoPriceCache.data;
  }

  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=CELOUSDT");
    const json: any = await res.json();
    if (json && json.price) {
      const price = parseFloat(json.price);
      celoPriceCache.data = price;
      celoPriceCache.timestamp = Date.now();
      return price;
    }
  } catch (e) {
    console.warn("Binance price API failed, trying Coingecko...", e);
  }

  try {
    const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=celo&vs_currencies=usd");
    const json: any = await res.json();
    if (json && json.celo && json.celo.usd) {
      celoPriceCache.data = json.celo.usd;
      celoPriceCache.timestamp = Date.now();
      return json.celo.usd;
    }
  } catch (e) {
    console.warn("Coingecko price API failed, using fallback Celo price ($0.077)", e);
  }

  const fallback = 0.07724;
  celoPriceCache.data = fallback;
  celoPriceCache.timestamp = Date.now();
  return fallback;
}

export async function getEnsName(address: string): Promise<string | null> {
  // 1. Try Mainnet ENS
  try {
    const mainnetName = await mainnetClient.getEnsName({ address: address as `0x${string}` });
    if (mainnetName) return mainnetName;
  } catch (e) {
    // Ignore error
  }

  // 2. Try Base Basenames
  try {
    const baseName = await baseClient.getEnsName({ address: address as `0x${string}` });
    if (baseName) return baseName;
  } catch (e) {
    // Ignore error
  }

  return null;
}

export async function getWalletAgeMonths(address: string): Promise<number> {
  try {
    const res = await fetch(`https://celo.blockscout.com/api?module=account&action=txlist&address=${address}&sort=asc&page=1&offset=1`);
    const json: any = await res.json();
    if (json && json.status === "1" && json.result && json.result.length > 0) {
      const timeStamp = parseInt(json.result[0].timeStamp);
      const ageMs = Date.now() - timeStamp * 1000;
      return Math.max(0, Math.floor(ageMs / (1000 * 60 * 60 * 24 * 30.4368))); // average month length
    }
  } catch (e) {
    console.warn("Failed to get wallet age from Blockscout:", e);
  }
  return 0;
}

async function fetchWalletBalancesUncached(address: string) {
  const celoPrice = await getCeloPrice();
  
  // 1. Get native Celo balance
  let celoBalance = 0n;
  try {
    celoBalance = await publicClient.getBalance({ address: address as `0x${string}` });
  } catch (e) {
    console.error("Failed to get Celo balance:", e);
  }
  
  const celoUsdValue = parseFloat(formatUnits(celoBalance, 18)) * celoPrice;

  // 2. Discover ERC-20 tokens from tokentx history
  const discoveredTokens = new Map<string, { symbol: string; name: string; decimals: number }>();
  
  try {
    const res = await fetch(`https://celo.blockscout.com/api?module=account&action=tokentx&address=${address}&offset=1000`);
    const json: any = await res.json();
    if (json && json.status === "1" && Array.isArray(json.result)) {
      for (const tx of json.result) {
        if (tx.contractAddress && tx.tokenSymbol) {
          const addr = tx.contractAddress.toLowerCase();
          const symbol = tx.tokenSymbol;
          const name = tx.tokenName || symbol;
          const decimals = parseInt(tx.tokenDecimal || "18");
          discoveredTokens.set(addr, { symbol, name, decimals });
        }
      }
    }
  } catch (e) {
    console.warn("Failed to fetch token transfers from Blockscout:", e);
  }

  // 3. Merge with stablecoin config contracts to ensure we scan them
  for (const [stableAddr, info] of Object.entries(STABLECOINS)) {
    if (!discoveredTokens.has(stableAddr)) {
      discoveredTokens.set(stableAddr, {
        symbol: info.symbol,
        name: info.name,
        decimals: info.decimals
      });
    }
  }

  // Limit multicall scope: always keep stablecoins, cap other discovered tokens
  const stableAddresses = new Set(Object.keys(STABLECOINS));
  const nonStableAddresses = Array.from(discoveredTokens.keys()).filter((addr) => !stableAddresses.has(addr));
  if (nonStableAddresses.length > MAX_DISCOVERED_TOKENS) {
    for (const addr of nonStableAddresses.slice(MAX_DISCOVERED_TOKENS)) {
      discoveredTokens.delete(addr);
    }
  }

  // 4. Query balanceOf for all discovered tokens via Multicall
  const tokenAddresses = Array.from(discoveredTokens.keys()) as `0x${string}`[];
  const contracts = tokenAddresses.map(addr => ({
    address: addr,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address]
  }));

  let balances: any[] = [];
  if (contracts.length > 0) {
    try {
      // Chunk multicalls to prevent extremely large RPC payloads if there are too many tokens
      const chunkSize = 30;
      for (let i = 0; i < contracts.length; i += chunkSize) {
        const chunk = contracts.slice(i, i + chunkSize);
        const results = await publicClient.multicall({ contracts: chunk });
        balances.push(...results);
      }
    } catch (e) {
      console.warn("Multicall failed, falling back to individual queries...", e);
      // Fallback: individual queries
      for (const call of contracts) {
        try {
          const bal = await publicClient.readContract({
            address: call.address,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: call.args as [`0x${string}`]
          });
          balances.push({ status: 'success', result: bal });
        } catch (err) {
          balances.push({ status: 'failure', error: err });
        }
      }
    }
  }

  let stablecoinBalance = 0;
  let volatileBalance = celoUsdValue;
  let defiExposure = 0;
  const tokenList: Array<{
    address: string;
    symbol: string;
    name: string;
    balance: number;
    usdValue: number;
    isStable: boolean;
    isDefi: boolean;
  }> = [];

  // Add CELO as a token entry
  tokenList.push({
    address: "0x0000000000000000000000000000000000000000",
    symbol: "CELO",
    name: "Celo Native Asset",
    balance: parseFloat(formatUnits(celoBalance, 18)),
    usdValue: celoUsdValue,
    isStable: false,
    isDefi: false
  });

  // 5. Parse multicall results
  for (let i = 0; i < tokenAddresses.length; i++) {
    const addr = tokenAddresses[i];
    const info = discoveredTokens.get(addr)!;
    const balanceRes = balances[i];
    
    if (balanceRes && balanceRes.status === 'success') {
      const rawBalance = balanceRes.result as bigint;
      if (rawBalance > 0n) {
        const balance = parseFloat(formatUnits(rawBalance, info.decimals));
        
        let usdRate = 0;
        let isStable = false;
        let isDefi = false;

        // Check if it's a known stablecoin
        if (STABLECOINS[addr]) {
          usdRate = STABLECOINS[addr].usdRate;
          isStable = true;
        } else if (addr === "0x471ece3750da237f93b8e339c536989b8978a438") {
          // Wrapped CELO contract address (CELO ERC20)
          usdRate = celoPrice;
        } else {
          // Dynamic pricing estimation for major assets
          const sym = info.symbol.toUpperCase();
          const name = info.name.toLowerCase();

          if (sym === "BTC" || sym === "WBTC") {
            usdRate = 65000;
          } else if (sym === "ETH" || sym === "WETH") {
            usdRate = 3000;
          } else if (
            sym.startsWith("A") || 
            sym.startsWith("AM") || 
            name.includes("aave") || 
            name.includes("pool") || 
            name.includes("lp") || 
            sym.includes("LP") ||
            name.includes("ubeswap lp")
          ) {
            // DeFi Exposure
            isDefi = true;
            if (sym.includes("CELO")) {
              usdRate = celoPrice;
            } else {
              usdRate = 1.0; // default DeFi LP estimation
            }
          } else {
            // Default pricing for other unknown assets
            usdRate = 0.0;
          }
        }

        const usdValue = balance * usdRate;

        if (isStable) {
          stablecoinBalance += usdValue;
        } else if (isDefi) {
          defiExposure += usdValue;
        } else if (addr !== "0x471ece3750da237f93b8e339c536989b8978a438") {
          // Volatile asset (exclude wrapped Celo if native Celo is already counted)
          volatileBalance += usdValue;
        }

        tokenList.push({
          address: addr,
          symbol: info.symbol,
          name: info.name,
          balance,
          usdValue,
          isStable,
          isDefi
        });
      }
    }
  }

  return {
    stablecoinBalance: parseFloat(stablecoinBalance.toFixed(2)),
    volatileBalance: parseFloat(volatileBalance.toFixed(2)),
    defiExposure: parseFloat(defiExposure.toFixed(2)),
    tokens: tokenList,
    celoPrice
  };
}

export async function getWalletBalances(address: string) {
  const key = address.toLowerCase();
  const cached = balanceCache.get(key);
  if (isFresh(cached, DATA_CACHE_TTL_MS)) {
    return cached.data;
  }

  const data = await dedupe(`balances:${key}`, () => fetchWalletBalancesUncached(key));
  balanceCache.set(key, { data, timestamp: Date.now() });
  return data;
}

async function fetchWalletTransactionsUncached(address: string, celoPrice: number, months: number) {
  const transactions: Array<{
    hash: string;
    chain: string;
    timestamp: string;
    type: "inflow" | "outflow";
    amountUsd: number;
    amountToken: number;
    token: string;
    counterparty: string;
    protocol?: string;
  }> = [];

  const addrLower = address.toLowerCase();
  const monthsAgoSec = Math.floor((Date.now() - months * 30 * 24 * 60 * 60 * 1000) / 1000);

  // 1. Fetch normal transactions
  try {
    const json: any = await fetchJsonWithTimeout(
      `https://celo.blockscout.com/api?module=account&action=txlist&address=${address}&offset=100`
    );
    if (json && json.status === "1" && Array.isArray(json.result)) {
      for (const tx of json.result) {
        if (parseInt(tx.timeStamp) < monthsAgoSec) {
          continue;
        }
        if (tx.isError === "0" && tx.value && tx.value !== "0") {
          const valCelo = parseFloat(formatUnits(BigInt(tx.value), 18));
          const amountUsd = valCelo * celoPrice;
          const isOutflow = tx.from.toLowerCase() === addrLower;
          
          transactions.push({
            hash: tx.hash,
            chain: "celo",
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
            type: isOutflow ? "outflow" : "inflow",
            amountUsd: parseFloat(amountUsd.toFixed(6)),
            amountToken: valCelo,
            token: "CELO",
            counterparty: (isOutflow ? tx.to : tx.from).toLowerCase(),
            protocol: identifyProtocol(tx.to, "CELO")
          });
        }
      }
    }
  } catch (e) {
    console.warn("Failed to fetch normal transactions:", e);
  }

  // 2. Fetch token transfers
  try {
    const json: any = await fetchJsonWithTimeout(
      `https://celo.blockscout.com/api?module=account&action=tokentx&address=${address}&offset=100`
    );
    if (json && json.status === "1" && Array.isArray(json.result)) {
      for (const tx of json.result) {
        if (parseInt(tx.timeStamp) < monthsAgoSec) {
          continue;
        }
        const value = BigInt(tx.value || "0");
        if (value > 0n) {
          const decimals = parseInt(tx.tokenDecimal || "18");
          const balance = parseFloat(formatUnits(value, decimals));
          
          let usdRate = 0;
          const tokenAddr = tx.contractAddress.toLowerCase();
          const tokenSymbol = tx.tokenSymbol || "ERC20";
          const tokenName = tx.tokenName || "";

          if (STABLECOINS[tokenAddr]) {
            usdRate = STABLECOINS[tokenAddr].usdRate;
          } else if (tokenAddr === "0x471ece3750da237f93b8e339c536989b8978a438") {
            usdRate = celoPrice;
          } else {
            const sym = tokenSymbol.toUpperCase();
            if (sym === "BTC" || sym === "WBTC") {
              usdRate = 65000;
            } else if (sym === "ETH" || sym === "WETH") {
              usdRate = 3000;
            } else if (sym.startsWith("A") || sym.startsWith("AM") || tokenName.toLowerCase().includes("aave")) {
              usdRate = 1.0;
            }
          }

          const amountUsd = balance * usdRate;
          const isOutflow = tx.from.toLowerCase() === addrLower;

          transactions.push({
            hash: tx.hash,
            chain: "celo",
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
            type: isOutflow ? "outflow" : "inflow",
            amountUsd: parseFloat(amountUsd.toFixed(6)),
            amountToken: balance,
            token: tokenSymbol,
            counterparty: (isOutflow ? tx.to : tx.from).toLowerCase(),
            protocol: identifyProtocol(tx.to || tx.from || tokenAddr, tokenSymbol)
          });
        }
      }
    }
  } catch (e) {
    console.warn("Failed to fetch token transfers:", e);
  }

  // Sort by timestamp descending
  transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return transactions;
}

export async function getWalletTransactions(address: string, celoPrice: number, months: number = 3) {
  const key = address.toLowerCase();
  const cached = transactionCache.get(key);
  if (isFresh(cached, DATA_CACHE_TTL_MS)) {
    return filterTransactionsByMonths(cached.data, months);
  }

  const transactions = await dedupe(`transactions:${key}`, () =>
    fetchWalletTransactionsUncached(key, celoPrice, months)
  );
  transactionCache.set(key, { data: transactions, timestamp: Date.now() });
  return filterTransactionsByMonths(transactions, months);
}

export function computePeriodFlow(transactions: TransactionDetails[], months: number) {
  const filtered = filterTransactionsByMonths(transactions, months);
  let inbound = 0;
  let outbound = 0;
  for (const tx of filtered) {
    if (tx.type === "inflow") inbound += tx.amountUsd;
    else outbound += tx.amountUsd;
  }
  return {
    inbound: parseFloat(inbound.toFixed(2)),
    outbound: parseFloat(outbound.toFixed(2)),
    net: parseFloat((inbound - outbound).toFixed(2)),
    transactionCount: filtered.length
  };
}

export interface TransactionDetails {
  hash: string;
  chain: string;
  timestamp: string;
  type: "inflow" | "outflow";
  amountUsd: number;
  amountToken: number;
  token: string;
  counterparty: string;
  protocol?: string;
}

export async function getWalletFirstAndLastTransactions(address: string, celoPrice: number): Promise<{
  firstTransaction: TransactionDetails | null;
  lastTransaction: TransactionDetails | null;
}> {
  const addrLower = address.toLowerCase();

  const urls = [
    `https://celo.blockscout.com/api?module=account&action=txlist&address=${address}&sort=asc&page=1&offset=1`,
    `https://celo.blockscout.com/api?module=account&action=txlist&address=${address}&sort=desc&page=1&offset=1`,
    `https://celo.blockscout.com/api?module=account&action=tokentx&address=${address}&sort=asc&page=1&offset=1`,
    `https://celo.blockscout.com/api?module=account&action=tokentx&address=${address}&sort=desc&page=1&offset=1`
  ];

  try {
    const responses = await Promise.all(
      urls.map(url => 
        fetch(url)
          .then(r => r.json() as any)
          .catch(err => {
            console.warn(`Failed to fetch URL ${url}:`, err);
            return null;
          })
      )
    );
    const [firstNormalJson, lastNormalJson, firstTokenJson, lastTokenJson] = responses;

    const candidateFirstTxs: TransactionDetails[] = [];
    const candidateLastTxs: TransactionDetails[] = [];

    // Helper to format blockscout normal tx
    const formatNormalTx = (tx: any): TransactionDetails => {
      const valCelo = parseFloat(formatUnits(BigInt(tx.value || "0"), 18));
      const amountUsd = valCelo * celoPrice;
      const isOutflow = tx.from.toLowerCase() === addrLower;
      return {
        hash: tx.hash,
        chain: "celo",
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        type: isOutflow ? "outflow" : "inflow",
        amountUsd: parseFloat(amountUsd.toFixed(6)),
        amountToken: valCelo,
        token: "CELO",
        counterparty: (isOutflow ? tx.to : tx.from).toLowerCase(),
        protocol: identifyProtocol(tx.to, "CELO")
      };
    };

    // Helper to format blockscout token tx
    const formatTokenTx = (tx: any): TransactionDetails => {
      const value = BigInt(tx.value || "0");
      const decimals = parseInt(tx.tokenDecimal || "18");
      const balance = parseFloat(formatUnits(value, decimals));
      
      let usdRate = 0;
      const tokenAddr = tx.contractAddress.toLowerCase();
      const tokenSymbol = tx.tokenSymbol || "ERC20";
      const tokenName = tx.tokenName || "";

      if (STABLECOINS[tokenAddr]) {
        usdRate = STABLECOINS[tokenAddr].usdRate;
      } else if (tokenAddr === "0x471ece3750da237f93b8e339c536989b8978a438") {
        usdRate = celoPrice;
      } else {
        const sym = tokenSymbol.toUpperCase();
        if (sym === "BTC" || sym === "WBTC") {
          usdRate = 65000;
        } else if (sym === "ETH" || sym === "WETH") {
          usdRate = 3000;
        } else if (sym.startsWith("A") || sym.startsWith("AM") || tokenName.toLowerCase().includes("aave")) {
          usdRate = 1.0;
        }
      }
      const amountUsd = balance * usdRate;
      const isOutflow = tx.from.toLowerCase() === addrLower;

      return {
        hash: tx.hash,
        chain: "celo",
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        type: isOutflow ? "outflow" : "inflow",
        amountUsd: parseFloat(amountUsd.toFixed(6)),
        amountToken: balance,
        token: tokenSymbol,
        counterparty: (isOutflow ? tx.to : tx.from).toLowerCase(),
        protocol: identifyProtocol(tx.to || tx.from || tokenAddr, tokenSymbol)
      };
    };

    if (firstNormalJson?.status === "1" && Array.isArray(firstNormalJson.result) && firstNormalJson.result.length > 0) {
      candidateFirstTxs.push(formatNormalTx(firstNormalJson.result[0]));
    }
    if (lastNormalJson?.status === "1" && Array.isArray(lastNormalJson.result) && lastNormalJson.result.length > 0) {
      candidateLastTxs.push(formatNormalTx(lastNormalJson.result[0]));
    }
    if (firstTokenJson?.status === "1" && Array.isArray(firstTokenJson.result) && firstTokenJson.result.length > 0) {
      candidateFirstTxs.push(formatTokenTx(firstTokenJson.result[0]));
    }
    if (lastTokenJson?.status === "1" && Array.isArray(lastTokenJson.result) && lastTokenJson.result.length > 0) {
      candidateLastTxs.push(formatTokenTx(lastTokenJson.result[0]));
    }

    // Sort candidates
    candidateFirstTxs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    candidateLastTxs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      firstTransaction: candidateFirstTxs[0] || null,
      lastTransaction: candidateLastTxs[0] || null
    };
  } catch (e) {
    console.warn("Failed to fetch first and last transactions:", e);
    return { firstTransaction: null, lastTransaction: null };
  }
}

// function to get all the transactions number for a wallet
export async function getWalletTransactionsNumber(address: string): Promise<number> {
  try {
    const res = await fetch(`https://celo.blockscout.com/api?module=account&action=txlist&address=${address}&offset=1000`);
    const json: any = await res.json();
    return json.result.length;
  } catch (e) {
    console.warn("Failed to fetch transactions number:", e);
    return 0;
  }
}

export async function getNftExposure(address: string): Promise<{ nftExposure: number; nftCount: number }> {
  const key = address.toLowerCase();
  const cached = nftCache.get(key);
  if (isFresh(cached, DATA_CACHE_TTL_MS)) {
    return cached.data;
  }

  const data = await dedupe(`nft:${key}`, () => fetchNftExposureUncached(key));
  nftCache.set(key, { data, timestamp: Date.now() });
  return data;
}

async function fetchNftExposureUncached(address: string): Promise<{ nftExposure: number; nftCount: number }> {
  try {
    const res = await fetch(`https://celo.blockscout.com/api?module=account&action=tokennfttx&address=${address}&offset=1000`);
    const json: any = await res.json();
    if (json && json.status === "1" && Array.isArray(json.result)) {
      const nftInventory = new Set<string>();
      const addrLower = address.toLowerCase();
      
      // Sort in chronological order to accurately track ownership status
      const transfers = [...json.result].sort((a, b) => parseInt(a.timeStamp) - parseInt(b.timeStamp));
      
      for (const tx of transfers) {
        if (tx.contractAddress && tx.tokenID) {
          const key = `${tx.contractAddress.toLowerCase()}-${tx.tokenID}`;
          const isReceived = tx.to.toLowerCase() === addrLower;
          if (isReceived) {
            nftInventory.add(key);
          } else {
            nftInventory.delete(key);
          }
        }
      }

      const nftCount = nftInventory.size;
      return {
        nftCount,
        nftExposure: nftCount * 100 // $100 average value per NFT
      };
    }
  } catch (e) {
    console.warn("Failed to get NFT exposure:", e);
  }
  return { nftExposure: 0, nftCount: 0 };
}

/** Pre-fetch and populate the shared cache used by analysis tools. */
export async function warmWalletDataCache(address: string, months: number = 12) {
  const normalized = address.toLowerCase();
  const balances = await getWalletBalances(normalized);
  const [ens, walletAgeMonths, nft, txBounds, transactions] = await Promise.all([
    getEnsName(normalized),
    getWalletAgeMonths(normalized),
    getNftExposure(normalized),
    getWalletFirstAndLastTransactions(normalized, balances.celoPrice),
    getWalletTransactions(normalized, balances.celoPrice, months)
  ]);

  const protocolSet = new Set<string>();
  for (const t of balances.tokens) {
    if (t.isDefi) {
      if (t.symbol.toUpperCase().includes("AAVE") || t.symbol.toUpperCase().startsWith("A") || t.symbol.toUpperCase().startsWith("AM")) {
        protocolSet.add("Aave");
      } else if (t.name.toLowerCase().includes("ubeswap")) {
        protocolSet.add("Ubeswap");
      }
    }
  }
  if (nft.nftCount > 0) protocolSet.add("OpenSea");

  fullOnchainDataCache.set(normalized, {
    walletAddress: normalized,
    ens,
    walletAgeMonths,
    firstTransaction: txBounds.firstTransaction,
    lastTransaction: txBounds.lastTransaction,
    stablecoinBalance: balances.stablecoinBalance,
    volatileBalance: balances.volatileBalance,
    defiExposure: balances.defiExposure,
    nftExposure: nft.nftExposure,
    nftCount: nft.nftCount,
    protocols: Array.from(protocolSet),
    tokens: balances.tokens,
    celoPrice: balances.celoPrice,
    transactions
  });

  return fullOnchainDataCache.get(normalized)!;
}

function identifyProtocol(targetAddress: string, tokenSymbol: string): string | undefined {
  const addr = targetAddress ? targetAddress.toLowerCase() : "";
  const sym = tokenSymbol ? tokenSymbol.toUpperCase() : "";

  // 1. Aave V3 address and token checks
  if (
    addr === "0x794a61358d6845594f94dc1db02a252b5b4814ad" || 
    sym.startsWith("A") || 
    sym.startsWith("AM") || 
    sym.includes("AAVE")
  ) {
    return "Aave";
  }

  // 2. Uniswap V3 checks
  if (
    addr === "0x5615cdb7c0672a0ecb7f78885c4f7f29f79e9b5a" || 
    sym === "UNI"
  ) {
    return "Uniswap";
  }

  // 3. Mento checks
  if (
    sym === "CUSD" || 
    sym === "CEUR" || 
    sym === "CREAL" || 
    sym === "USDM" || 
    sym === "EURM" || 
    sym === "BRLM"
  ) {
    return "Mento";
  }

  // 4. GoodDollar checks
  if (sym === "G$") {
    return "GoodDollar";
  }

  return undefined;
}

export const fullOnchainDataCache = new Map<string, any>();