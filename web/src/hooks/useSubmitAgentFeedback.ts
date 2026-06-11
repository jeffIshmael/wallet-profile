"use client";

import { useCallback } from "react";
import type { EIP1193Provider } from "viem";
import { markFeedbackSubmitted, submitErc8004Feedback } from "@/lib/blockchain/erc8004Feedback";

function getInjectedProvider(): EIP1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { ethereum?: EIP1193Provider }).ethereum;
}

export function useSubmitAgentFeedback(address: string | null) {
  return useCallback(
    async (stars: number) => {
      if (!address) throw new Error("Connect a wallet to submit feedback.");

      const provider = getInjectedProvider();
      if (!provider) {
        throw new Error("No wallet provider available. Connect MiniPay or an external wallet.");
      }

      const result = await submitErc8004Feedback(provider, address as `0x${string}`, stars);
      markFeedbackSubmitted(address);
      void result;
    },
    [address]
  );
}
