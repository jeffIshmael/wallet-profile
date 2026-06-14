import {
  createPublicClient,
  decodeEventLog,
  erc20Abi,
  http,
  parseUnits,
  type Address,
  type Hash
} from "viem";
import { celo } from "@/lib/chains/celo";
import { USDT_CELO_MAINNET } from "@/lib/blockchain/constants";

function getCeloRpcUrl(): string {
  return process.env.CELO_RPC_URL?.trim() || "https://forno.celo.org";
}

/**
 * Verify a confirmed USDT transfer from `from` to `payTo` for at least `amountUsdt`.
 * Used when MiniPay clients pay via direct transfer instead of x402 EIP-712 signatures.
 */
export async function verifyUsdtTransferPayment(
  txHash: Hash,
  from: Address,
  payTo: Address,
  amountUsdt: string
): Promise<boolean> {
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(getCeloRpcUrl())
  });

  const receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  if (receipt.status !== "success") return false;

  const minAmount = parseUnits(amountUsdt, 6);
  const fromLower = from.toLowerCase();
  const payToLower = payTo.toLowerCase();

  for (const log of receipt.logs) {
    if (log.address.toLowerCase() !== USDT_CELO_MAINNET.toLowerCase()) continue;

    try {
      const decoded = decodeEventLog({
        abi: erc20Abi,
        eventName: "Transfer",
        data: log.data,
        topics: log.topics
      });

      if (
        decoded.args.from.toLowerCase() === fromLower &&
        decoded.args.to.toLowerCase() === payToLower &&
        decoded.args.value >= minAmount
      ) {
        return true;
      }
    } catch {
      // Not a Transfer event — skip.
    }
  }

  return false;
}
