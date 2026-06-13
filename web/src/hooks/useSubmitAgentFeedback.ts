"use client";

import { useCallback } from "react";
import {
  markFeedbackSubmitted,
  submitErc8004Feedback,
  type AgentFeedbackTagId
} from "@/lib/blockchain/erc8004Feedback";
import { useAuth } from "@/providers/AuthProvider";

export function useSubmitAgentFeedback(address: string | null) {
  const { getEthereumProvider } = useAuth();

  return useCallback(
    async (tags: AgentFeedbackTagId[]) => {
      if (!address) throw new Error("Connect a wallet to submit feedback.");

      const provider = await getEthereumProvider();
      if (!provider) {
        throw new Error("No wallet provider available. Connect MiniPay or an external wallet.");
      }

      const result = await submitErc8004Feedback(provider, address as `0x${string}`, tags);
      markFeedbackSubmitted(address);
      void result;
    },
    [address, getEthereumProvider]
  );
}
