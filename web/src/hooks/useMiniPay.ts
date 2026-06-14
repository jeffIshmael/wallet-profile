"use client";

import { useCallback, useEffect, useState } from "react";
import { createPublicClient, createWalletClient, custom, formatUnits, http } from "viem";
import { celo } from "@/lib/chains/celo";

const USDM_ADDRESS = "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;

const BALANCE_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  }
] as const;

export function useMiniPay() {
  const [address, setAddress] = useState<`0x${string}` | null>(null);
  const [balance, setBalance] = useState("0");
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const publicClient = createPublicClient({
    chain: celo,
    transport: http()
  });

  const refreshBalance = useCallback(async () => {
    if (!address) return;
    const bal = await publicClient.readContract({
      address: USDM_ADDRESS,
      abi: BALANCE_ABI,
      functionName: "balanceOf",
      args: [address]
    });
    setBalance(formatUnits(bal, 18));
  }, [address, publicClient]);

  const connect = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum?.isMiniPay) return null;

    const client = createWalletClient({
      chain: celo,
      transport: custom(window.ethereum)
    });
    const [addr] = await client.requestAddresses();
    setAddress(addr);
    return addr;
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setBalance("0");
  }, []);

  useEffect(() => {
    async function init() {
      if (typeof window === "undefined" || !window.ethereum) {
        setIsLoading(false);
        return;
      }

      const mp = window.ethereum.isMiniPay === true;
      setIsMiniPay(mp);

      if (!mp) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const client = createWalletClient({
          chain: celo,
          transport: custom(window.ethereum)
        });
        const timeout = new Promise<never>((_, reject) => {
          window.setTimeout(() => reject(new Error("MiniPay init timed out")), 5000);
        });
        const [addr] = await Promise.race([client.getAddresses(), timeout]);
        setAddress(addr);
      } catch {
        setAddress(null);
      } finally {
        setIsLoading(false);
      }
    }

    void init();
  }, []);

  useEffect(() => {
    if (address) refreshBalance();
  }, [address, refreshBalance]);

  return { address, balance, isMiniPay, isLoading, refreshBalance, connect, disconnect };
}
