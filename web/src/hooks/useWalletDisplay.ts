"use client";

import { useMemo } from "react";
import { truncateAddress } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";

/** Wallet label for nav/header — truncated address when connected. */
export function useWalletDisplay() {
  const { address, miniPay, connectingMiniPay } = useAuth();

  return useMemo(
    () => ({
      address,
      miniPay,
      connecting: connectingMiniPay,
      /** Primary identifier shown in nav/header. */
      primaryLabel: miniPay
        ? connectingMiniPay
          ? "Connecting…"
          : address
            ? truncateAddress(address)
            : "MiniPay"
        : address
          ? truncateAddress(address)
          : "",
      /** Secondary hint — omitted in MiniPay (phone-first identity). */
      secondaryHint: null
    }),
    [address, miniPay, connectingMiniPay]
  );
}
