import { createPublicClient, http, type Hash } from "viem";
import { celo } from "@/lib/chains/celo";

const RECEIPT_TIMEOUT_MS = 120_000;

export async function waitForTxReceipt(hash: Hash): Promise<void> {
  const publicClient = createPublicClient({
    chain: celo,
    transport: http()
  });

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    timeout: RECEIPT_TIMEOUT_MS
  });

  if (receipt.status === "reverted") {
    throw new Error("Transaction reverted on chain.");
  }
}
