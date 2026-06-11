"use client";

import { useCallback, useEffect, useRef } from "react";
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
        paidFetchRef.current = await createPaidFetch(getEthereumProvider);
        walletKeyRef.current = walletKey;
      }

      return paidFetchRef.current(input as RequestInfo, init);
    },
    [address, authenticated, getEthereumProvider]
  );
}

export const useAgentChatFetch = usePaidApiFetch;
