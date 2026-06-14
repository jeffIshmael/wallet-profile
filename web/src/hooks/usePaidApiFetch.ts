"use client";

import { useCallback, useEffect, useRef } from "react";
import { formatWalletTxError } from "@/lib/privy/formatWalletTxError";
import { createPaidFetch } from "@/lib/x402/createPaidFetch";
import { useAuth } from "@/providers/AuthProvider";

export type PaidFetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/** x402-aware fetch using Privy / MiniPay — no separate thirdweb sign-in. */
export function usePaidApiFetch(): PaidFetchFn {
  const { address, authenticated, getEthereumProvider } = useAuth();
  const paidFetchRef = useRef<PaidFetchFn | null>(null);
  const walletKeyRef = useRef<string | null>(null);

  useEffect(() => {
    paidFetchRef.current = null;
    walletKeyRef.current = null;
  }, [address]);

  return useCallback<PaidFetchFn>(
    async (input, init) => {
      if (!authenticated || !address) {
        return fetch(input, init);
      }

      const walletKey = address.toLowerCase();
      if (!paidFetchRef.current || walletKeyRef.current !== walletKey) {
        try {
          paidFetchRef.current = await createPaidFetch(getEthereumProvider, address);
          walletKeyRef.current = walletKey;
        } catch (error) {
          throw new Error(formatWalletTxError(error));
        }
      }

      try {
        return await paidFetchRef.current(input as RequestInfo, init);
      } catch (error) {
        throw new Error(formatWalletTxError(error));
      }
    },
    [address, authenticated, getEthereumProvider]
  );
}

export const useAgentChatFetch = usePaidApiFetch;
