"use client";

import type { EIP1193Provider } from "viem";

type PaidFetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/** Build an x402 fetch wrapper using the app's already-connected EIP-1193 wallet. */
export async function createPaidFetch(
  getEthereumProvider: () => Promise<EIP1193Provider | undefined>
): Promise<PaidFetchFn> {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID?.trim();
  if (!clientId) {
    return fetch;
  }

  const provider = await getEthereumProvider();
  if (!provider) {
    throw new Error("Connect your wallet before making a paid request.");
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

  return wrapFetchWithPayment(fetch, client, wallet);
}
