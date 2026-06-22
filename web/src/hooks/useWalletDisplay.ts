"use client";

import { useMemo } from "react";
import { truncateAddress } from "@/lib/format";
import { useAuth } from "@/providers/AuthProvider";

/** MiniPay-friendly wallet label — phone-first identity; address only as secondary hint. */
export function useWalletDisplay() {
  const { address, miniPay, connectingMiniPay } = useAuth();

  return useMemo(
    () => ({
      address,
      miniPay,
      connecting: connectingMiniPay,
      /** Primary identifier shown in nav/header (never raw 0x in MiniPay). */
      primaryLabel: miniPay
        ? connectingMiniPay
          ? "Connecting…"
          : address
            ? "My Wallet"
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
