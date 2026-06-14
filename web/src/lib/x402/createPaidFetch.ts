"use client";

import type { EIP1193Provider } from "viem";
import { formatWalletTxError } from "@/lib/privy/formatWalletTxError";

type PaidFetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

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
          "Wallet should prompt you to sign the USDT payment — retry follows automatically."
      );
      return response;
    }

    if (response.ok) {
      console.log(`[x402 client] ${path} succeeded (${response.status}) in ${Date.now() - started}ms.`);
      return response;
    }

    console.warn(
      `[x402 client] ${path} failed (${response.status}) in ${Date.now() - started}ms.`
    );
    return response;
  };
}

/** Build an x402 fetch wrapper using the app's already-connected EIP-1193 wallet. */
export async function createPaidFetch(
  getEthereumProvider: () => Promise<EIP1193Provider | undefined>
): Promise<PaidFetchFn> {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID?.trim();
  if (!clientId) {
    console.warn("[x402 client] NEXT_PUBLIC_THIRDWEB_CLIENT_ID not set — paid requests use plain fetch.");
    return fetch;
  }

  const provider = await getEthereumProvider();
  if (!provider) {
    throw new Error("Connect your wallet before making a paid request.");
  }

  try {
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

    const accounts = await provider.request({ method: "eth_accounts" });
    const address = Array.isArray(accounts) ? accounts[0] : undefined;
    console.log(
      `[x402 client] Payment wrapper ready on Celo` +
        (address ? ` (wallet ${String(address).slice(0, 10)}…)` : "")
    );

    return wrapWithX402Logging(
      wrapFetchWithPayment(fetch, client, wallet) as PaidFetchFn
    );
  } catch (error) {
    throw new Error(formatWalletTxError(error));
  }
}
