"use client";

import { walletAvatarColors } from "@/lib/walletAvatar";

export function WalletIdentityAvatar({ address, size = 36 }: { address: string; size?: number }) {
  const [c1, c2] = walletAvatarColors(address);

  return (
    <div
      className="shrink-0 rounded-full ring-1 ring-white/10"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${c1}, ${c2})`
      }}
      aria-hidden
    />
  );
}
