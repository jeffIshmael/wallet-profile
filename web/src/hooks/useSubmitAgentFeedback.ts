"use client";

import { useWallets } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useCallback } from "react";
import { concat, type Hex } from "viem";
import { toDataSuffix } from "@celo/attribution-tags";

import {
  buildGiveFeedbackCall,
  markFeedbackSubmitted,
  submitErc8004Feedback,
  type AgentFeedbackTagId
} from "@/lib/blockchain/erc8004Feedback";
import { formatWalletTxError } from "@/lib/privy/formatWalletTxError";
import { SMART_WALLET_NOT_READY } from "@/lib/privy/sponsoredProvider";
import { waitForTxReceipt } from "@/lib/privy/waitForTxReceipt";
import { useAuth } from "@/providers/AuthProvider";

export function useSubmitAgentFeedback(address: string | null) {
  const { getEthereumProvider, miniPay } = useAuth();
  const { wallets } = useWallets();
  const { client: smartWalletClient } = useSmartWallets();

  return useCallback(
    async (tags: AgentFeedbackTagId[]) => {
      if (!address) throw new Error("Connect a wallet to submit feedback.");

      const reviewerAddress = address as `0x${string}`;

      if (miniPay) {
        const provider = await getEthereumProvider();
        if (!provider) {
          throw new Error("No wallet provider available. Connect MiniPay or an external wallet.");
        }

        try {
          await submitErc8004Feedback(provider, reviewerAddress, tags);
          markFeedbackSubmitted(address);
        } catch (error) {
          throw new Error(formatWalletTxError(error, { miniPay }));
        }
        return;
      }

      const embeddedWallet = wallets.find(
        (wallet) =>
          wallet.walletClientType === "privy" &&
          wallet.address?.toLowerCase() === reviewerAddress.toLowerCase()
      );

      if (embeddedWallet?.address) {
        if (!smartWalletClient) {
          throw new Error(SMART_WALLET_NOT_READY);
        }

        const onChainReviewer = (smartWalletClient.account?.address ??
          reviewerAddress) as `0x${string}`;

        try {
          const { to, data } = await buildGiveFeedbackCall(onChainReviewer, tags);
          const attributionTag = process.env.NEXT_PUBLIC_ATTRIBUTION_TAG || "onfra";
          const taggedData = concat([data, toDataSuffix(attributionTag)]);
          const hash = await smartWalletClient.sendTransaction(
            {
              to,
              data: taggedData,
              value: 0n,
              type: "legacy"
            },
            { uiOptions: { showWalletUIs: false } }
          );

          await waitForTxReceipt(hash as Hex);
          markFeedbackSubmitted(address);
        } catch (error) {
          throw new Error(formatWalletTxError(error, { miniPay }));
        }
        return;
      }

      const provider = await getEthereumProvider();
      if (!provider) {
        throw new Error("No wallet provider available. Connect MiniPay or an external wallet.");
      }

      try {
        await submitErc8004Feedback(provider, reviewerAddress, tags);
        markFeedbackSubmitted(address);
      } catch (error) {
        throw new Error(formatWalletTxError(error, { miniPay: false }));
      }
    },
    [address, miniPay, wallets, smartWalletClient, getEthereumProvider]
  );
}
