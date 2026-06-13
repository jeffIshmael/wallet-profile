"use client";

import { useSendTransaction, useWallets } from "@privy-io/react-auth";
import { useCallback } from "react";
import { createPublicClient, http } from "viem";
import { celo } from "viem/chains";
import {
  buildGiveFeedbackCall,
  markFeedbackSubmitted,
  submitErc8004Feedback,
  type AgentFeedbackTagId
} from "@/lib/blockchain/erc8004Feedback";
import { CHAIN_ID } from "@/lib/blockchain/constants";
import {
  formatWalletTxError,
  isGasSponsorshipDisabledError,
  shouldUsePrivyGasSponsorship
} from "@/lib/privy/formatWalletTxError";
import { useAuth } from "@/providers/AuthProvider";

export function useSubmitAgentFeedback(address: string | null) {
  const { getEthereumProvider } = useAuth();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();

  return useCallback(
    async (tags: AgentFeedbackTagId[]) => {
      if (!address) throw new Error("Connect a wallet to submit feedback.");

      const reviewerAddress = address as `0x${string}`;
      const embeddedWallet = wallets.find(
        (wallet) =>
          wallet.walletClientType === "privy" &&
          wallet.address?.toLowerCase() === reviewerAddress.toLowerCase()
      );

      if (embeddedWallet?.address) {
        const { to, data } = await buildGiveFeedbackCall(reviewerAddress, tags);
        const tx = { to, data, chainId: CHAIN_ID };
        const options = {
          address: embeddedWallet.address,
          uiOptions: { showWalletUIs: false as const }
        };

        try {
          const sponsor = shouldUsePrivyGasSponsorship();
          const { hash } = await sendTransaction(tx, sponsor ? { ...options, sponsor: true } : options);

          const publicClient = createPublicClient({
            chain: celo,
            transport: http()
          });
          await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
          markFeedbackSubmitted(address);
          return;
        } catch (error) {
          if (shouldUsePrivyGasSponsorship() && isGasSponsorshipDisabledError(error)) {
            try {
              const { hash } = await sendTransaction(tx, options);
              const publicClient = createPublicClient({
                chain: celo,
                transport: http()
              });
              await publicClient.waitForTransactionReceipt({ hash: hash as `0x${string}` });
              markFeedbackSubmitted(address);
              return;
            } catch (retryError) {
              throw new Error(formatWalletTxError(retryError));
            }
          }

          throw new Error(formatWalletTxError(error));
        }
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
    [address, wallets, sendTransaction, getEthereumProvider]
  );
}
