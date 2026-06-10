// This tool is used to fetch the onchain balances of a wallet

import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { getWalletBalances } from "../lib/getWalletDetails.js";

export const fetchOnchainBalances = tool(
  async ({ walletAddress }) => {
    const address = walletAddress.toLowerCase();
    const balances = await getWalletBalances(address);
    
    // Return a simple object mapping symbol to balance for positive balances
    const positiveBalances: Record<string, string> = {};
    for (const t of balances.tokens) {
      if (t.balance > 0) {
        positiveBalances[t.symbol] = t.balance.toFixed(4);
      }
    }

    return JSON.stringify(positiveBalances, null, 2);
  },
  {
    name: "fetch_onchain_balances",
    description:
      "Fetches the non-zero token balances on Celo network. Required input is walletAddress.",
    schema: z.object({
      walletAddress: z
        .string()
        .describe(
          "The Ethereum/EVM wallet address to fetch balances for (starts with 0x)",
        ),
    }),
  },
);
