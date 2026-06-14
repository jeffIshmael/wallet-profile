"use client";

import type { EIP1193Provider } from "viem";
import { PRICING } from "@/lib/blockchain/constants";
import { formatWalletTxError } from "@/lib/privy/formatWalletTxError";
import { MINIPAY_TX_HEADER } from "@/lib/minipay/constants";
import { getX402ClientConfig } from "@/lib/x402/clientConfig";
import { payUsdtViaDirectTransfer } from "@/lib/x402/directUsdtPayment";

type PaidFetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type X402PriceTier = "external" | "report";

function describeRequest(input: RequestInfo | URL): string {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  try {
    return new URL(url, typeof window !== "undefined" ? window.location.origin : undefined).pathname;
  } catch {
    return String(url);
  }
}

function wrapWithX402Logging(baseFetch: PaidFetchFn): PaidFetchFn {
  return async (input, init) => {
    const path = describeRequest(input);
    const started = Date.now();
    console.log(`[x402 client] Requesting ${path}…`);

    const response = await baseFetch(input, init);

    if (response.status === 402) {
      console.log(
        `[x402 client] ${path} returned 402 Payment Required (${Date.now() - started}ms). ` +
          "Retrying with on-chain USDT transfer…"
      );
      return response;
    }

    if (response.ok) {
      console.log(`[x402 client] ${path} succeeded (${response.status}) in ${Date.now() - started}ms.`);
      return response;
    }

    console.warn(`[x402 client] ${path} failed (${response.status}) in ${Date.now() - started}ms.`);
    return response;
  };
}

function tierAmount(tier: X402PriceTier): string {
  return tier === "report" ? PRICING.verifiedReportUsdt : PRICING.externalWalletQueryUsdt;
}

/**
 * Production: pay via direct USDT transfer + tx-hash proof header.
 * Works with MetaMask, Privy smart wallets, and MiniPay (no EIP-712 signing).
 */
async function createDirectUsdtPaidFetch(
  provider: EIP1193Provider,
  account: `0x${string}`
): Promise<PaidFetchFn> {
  const config = await getX402ClientConfig();
  const payTo = config.payTo;

  return wrapWithX402Logging(async (input, init) => {
    const path = describeRequest(input);
    let response = await fetch(input, init);

    if (response.status !== 402) return response;

    const tier: X402PriceTier = path.includes("/report") ? "report" : "external";
    const amountUsdt = tierAmount(tier);

    if (!payTo?.startsWith("0x")) {
      throw new Error("Paid requests are not configured (missing treasury pay-to address).");
    }

    console.log(`[x402 client] Sending ${amountUsdt} USDT on Celo for ${path}…`);
    const txHash = await payUsdtViaDirectTransfer(provider, account, payTo, amountUsdt);

    const headers = new Headers(init?.headers);
    headers.set(MINIPAY_TX_HEADER, txHash);
    headers.set("X-PAYMENT-CALLER", account);

    response = await fetch(input, { ...init, headers });
    if (response.status === 402) {
      const payload = (await response.clone().json().catch(() => null)) as { error?: string } | null;
      throw new Error(payload?.error ?? "USDT payment was sent but the server rejected settlement. Try again.");
    }

    return response;
  });
}

/** Simulated dev mode: Thirdweb EIP-3009 signing (no real USDT movement). */
async function createSimulatedPaidFetch(
  provider: EIP1193Provider
): Promise<PaidFetchFn> {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID?.trim();
  if (!clientId) {
    console.warn("[x402 client] NEXT_PUBLIC_THIRDWEB_CLIENT_ID not set — paid requests use plain fetch.");
    return fetch;
  }

  const [{ createThirdwebClient }, { celo }, { wrapFetchWithPayment }, { EIP1193 }] =
    await Promise.all([
      import("thirdweb"),
      import("thirdweb/chains"),
      import("thirdweb/x402"),
      import("thirdweb/wallets")
    ]);

  const client = createThirdwebClient({ clientId });
  const wallet = EIP1193.fromProvider({ provider });

  try {
    await wallet.autoConnect({ client, chain: celo });
  } catch {
    await wallet.connect({ client, chain: celo });
  }

  console.log("[x402 client] Simulated payment wrapper ready (no real USDT transfers).");
  return wrapWithX402Logging(wrapFetchWithPayment(fetch, client, wallet) as PaidFetchFn);
}

/** Build an x402 fetch wrapper using the app's already-connected EIP-1193 wallet. */
export async function createPaidFetch(
  getEthereumProvider: () => Promise<EIP1193Provider | undefined>,
  account?: string | null
): Promise<PaidFetchFn> {
  const provider = await getEthereumProvider();
  if (!provider) {
    throw new Error("Connect your wallet before making a paid request.");
  }

  if (!account?.startsWith("0x")) {
    throw new Error("Connect your wallet before making a paid request.");
  }

  const config = await getX402ClientConfig();

  if (config.production) {
    return createDirectUsdtPaidFetch(provider, account as `0x${string}`);
  }

  try {
    return await createSimulatedPaidFetch(provider);
  } catch (error) {
    throw new Error(formatWalletTxError(error));
  }
}
