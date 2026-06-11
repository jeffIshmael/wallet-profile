import { createPublicClient, erc20Abi, formatUnits, http, type Address } from "viem";
import { celo } from "viem/chains";
import { USDT_CELO_MAINNET } from "@/lib/blockchain/constants";

const client = createPublicClient({
  chain: celo,
  transport: http(process.env.CELO_RPC_URL ?? "https://forno.celo.org")
});

export async function getUsdtBalance(walletAddress: string): Promise<number> {
  const raw = await client.readContract({
    address: USDT_CELO_MAINNET as Address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [walletAddress as Address]
  });

  return Number.parseFloat(formatUnits(raw, 6));
}

export async function assertSufficientUsdtBalance(
  walletAddress: string,
  requiredUsdt: string
): Promise<{ ok: true; balance: number } | { ok: false; balance: number; required: number }> {
  const required = Number.parseFloat(requiredUsdt);
  const balance = await getUsdtBalance(walletAddress);

  if (balance + 1e-9 < required) {
    return { ok: false, balance, required };
  }

  return { ok: true, balance };
}
