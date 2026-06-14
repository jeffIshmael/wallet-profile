import { createPublicClient, erc20Abi, formatUnits, http } from "viem";
import { celo } from "@/lib/chains/celo";
import { MINIPAY_STABLES } from "@/lib/minipay/constants";

export type PreferredStablecoin = {
  symbol: string;
  address: `0x${string}`;
  decimals: number;
  balance: bigint;
  human: number;
};

const publicClient = createPublicClient({
  chain: celo,
  transport: http(process.env.CELO_RPC_URL ?? "https://forno.celo.org")
});

export async function getPreferredStablecoin(
  user: `0x${string}`
): Promise<PreferredStablecoin | null> {
  const balances = await Promise.all(
    MINIPAY_STABLES.map(async (token) => {
      const raw = await publicClient.readContract({
        address: token.address as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [user]
      });
      return {
        ...token,
        balance: raw,
        human: Number(formatUnits(raw, token.decimals))
      };
    })
  );

  const withFunds = balances.filter((entry) => entry.balance > 0n);
  if (withFunds.length === 0) return null;

  withFunds.sort((a, b) => b.human - a.human);
  return withFunds[0] as PreferredStablecoin;
}

export async function getUsdtBalance(user: `0x${string}`): Promise<number> {
  const usdt = MINIPAY_STABLES.find((token) => token.symbol === "USDT");
  if (!usdt) return 0;

  const raw = await publicClient.readContract({
    address: usdt.address as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [user]
  });

  return Number(formatUnits(raw, usdt.decimals));
}
