"use client";

import { useWallets } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useCallback } from "react";
import type { Hex } from "viem";
import {
  buildGiveFeedbackCall,
  markFeedbackSubmitted,
  submitErc8004Feedback,
  type AgentFeedbackTagId
} from "@/lib/blockchain/erc8004Feedback";
import { formatWalletTxError } from "@/lib/privy/formatWalletTxError";
import { waitForTxReceipt } from "@/lib/privy/waitForTxReceipt";
import { useAuth } from "@/providers/AuthProvider";

const SMART_WALLET_NOT_READY =
  "Smart wallet is still initializing. Wait a few seconds and try again. If this persists, enable smart wallets and a Celo paymaster in the Privy Dashboard.";

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
          throw new Error(formatWalletTxError(error));
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
          const hash = await smartWalletClient.sendTransaction(
            {
              to,
              data,
              value: 0n,
              type: "legacy"
            },
            { uiOptions: { showWalletUIs: false } }
          );

          await waitForTxReceipt(hash as Hex);
          markFeedbackSubmitted(address);
        } catch (error) {
          throw new Error(formatWalletTxError(error));
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
        throw new Error(formatWalletTxError(error));
      }
    },
    [address, miniPay, wallets, smartWalletClient, getEthereumProvider]
  );
}
