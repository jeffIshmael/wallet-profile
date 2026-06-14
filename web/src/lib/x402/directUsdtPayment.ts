import {
  createPublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
  http,
  parseUnits,
  type Address,
  type EIP1193Provider,
  type Hash
} from "viem";
import { celo } from "@/lib/chains/celo";
import { USDT_CELO_MAINNET } from "@/lib/blockchain/constants";
import { isMiniPay, openMiniPayDeposit } from "@/lib/minipay";
import { getPreferredStablecoin, getUsdtBalance } from "@/lib/minipay/stablecoins";
import { feeTokenFromPreferred, sendMiniPayTransaction } from "@/lib/minipay/transactions";

const TRANSFER_ABI = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" }
    ],
    outputs: [{ name: "", type: "bool" }]
  }
] as const;

const publicClient = createPublicClient({
  chain: celo,
  transport: http("https://forno.celo.org")
});

export async function assertUsdtBalance(
  account: Address,
  requiredUsdt: string
): Promise<{ ok: true } | { ok: false; balance: number }> {
  const balance = await getUsdtBalance(account);
  const required = Number(requiredUsdt);
  if (Number.isFinite(required) && balance + 1e-9 >= required) {
    return { ok: true };
  }
  return { ok: false, balance };
}

/**
 * Production x402 payment: direct on-chain USDT transfer.
 * Avoids EIP-3009 / typed-data signing, which fails for many smart wallets.
 */
export async function payUsdtViaDirectTransfer(
  provider: EIP1193Provider,
  account: Address,
  payTo: Address,
  amountUsdt: string
): Promise<Hash> {
  const balanceCheck = await assertUsdtBalance(account, amountUsdt);
  if (!balanceCheck.ok) {
    if (isMiniPay()) openMiniPayDeposit();
    throw new Error(
      `Insufficient USDT balance. You need at least ${amountUsdt} USDT on Celo, but your wallet has ${balanceCheck.balance.toFixed(4)} USDT.`
    );
  }

  const data = encodeFunctionData({
    abi: TRANSFER_ABI,
    functionName: "transfer",
    args: [payTo, parseUnits(amountUsdt, 6)]
  });

  let hash: Hash;

  if (isMiniPay()) {
    const preferred = await getPreferredStablecoin(account);
    hash = await sendMiniPayTransaction(provider, {
      account,
      to: USDT_CELO_MAINNET,
      data,
      feeToken: feeTokenFromPreferred(preferred)
    });
  } else {
    const walletClient = createWalletClient({
      chain: celo,
      transport: custom(provider)
    });
    hash = await walletClient.sendTransaction({
      account,
      to: USDT_CELO_MAINNET,
      data,
      type: "legacy"
    });
  }

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}
