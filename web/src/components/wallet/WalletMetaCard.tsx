"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WalletIdentityAvatar } from "@/components/wallet/WalletIdentityAvatar";
import celoLogo from "@/public/celoLogo.jpg";
import { mockWallet } from "@/data/mockWallet";
import { formatTokenBalance, formatUtc, formatWalletAge, truncateAddress } from "@/lib/format";

function daysSince(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function WalletMetaCard() {
  const identity = [
    { label: "Wallet Address on Celo", value: truncateAddress(mockWallet.walletAddress, 8, 6), mono: true },
    { label: "ENS Name on Celo", value: mockWallet.ens, isEns: true },
    { label: "Wallet Age on Celo", value: formatWalletAge(mockWallet.walletAgeMonths) }
  ];

  const activity = [
    { label: "Total Txns on Celo", value: mockWallet.totalTransactions.toLocaleString(), mono: true },
    { label: "First Tx on Celo", value: formatUtc(mockWallet.firstTransaction.timestamp) },
    { label: "Last Tx on Celo", value: formatUtc(mockWallet.lastTransaction.timestamp) }
  ];

  const balances = mockWallet.tokens.map(({ symbol, balance }) => formatTokenBalance(balance, symbol));
  const balanceSlots = [...balances, "", ""].slice(0, 6);

  const lastActiveDays = daysSince(mockWallet.lastTransaction.timestamp);
  const healthLine = `Active for ${(mockWallet.walletAgeMonths / 12).toFixed(1)} years · ${mockWallet.totalTransactions} transactions · Last active ${lastActiveDays} days ago`;

  return (
    <Card compact className="h-full !py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <WalletIdentityAvatar address={mockWallet.walletAddress} size={40} />
          <div className="min-w-0">
            <SectionHeader
              compact
              title="Wallet Summary"
              help={{
                meaning: "Your onchain identity and activity timeline on the Celo network.",
                calculation: "Derived from the connected wallet address, ENS records, and first/last Celo transactions.",
                lenderRelevance: "Lenders use wallet age and transaction history to assess legitimacy and financial track record."
              }}
            />
            <p className="mt-1 text-[11px] leading-4 text-stardust">{healthLine}</p>
          </div>
        </div>

        <Image
          src={celoLogo}
          alt="Celo"
          width={50}
          height={50}
          className="h-12 w-12 "
        />
      </div>

      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="px-0 sm:px-4 lg:pl-0">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stardust">Identity</p>
            <dl className="space-y-2.5">
              {identity.map(({ label, value, mono, isEns }) => (
                <div key={label} className="flex min-h-[22px] items-baseline justify-between gap-3">
                  <dt className="shrink-0 text-[10px] text-stardust">{label}</dt>
                  <dd className="text-right">
                    {isEns && !value ? (
                      <Link
                        href="https://names.celo.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="ens-register-link inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] font-semibold text-stardust transition hover:border-btc-orange/50 hover:bg-btc-orange/10 hover:text-btc-orange"
                      >
                        Register ENS
                        <ExternalLink size={10} />
                      </Link>
                    ) : (
                      <span className={`text-sm font-semibold text-white ${mono ? "font-mono" : ""}`}>
                        {value ?? "None registered"}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="px-0 py-4 sm:px-4 sm:py-0 lg:py-0">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stardust">Activity</p>
            <dl className="space-y-2.5">
              {activity.map(({ label, value, mono }) => (
                <div key={label} className="flex min-h-[22px] items-baseline justify-between gap-3">
                  <dt className="shrink-0 text-[10px] text-stardust">{label}</dt>
                  <dd className={`text-right text-sm font-semibold text-white ${mono ? "font-mono" : ""}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="px-0 py-4 sm:col-span-2 sm:px-4 sm:py-0 lg:col-span-2 lg:pr-0">
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-stardust">Balances</p>
            <dl className="grid grid-cols-2 grid-rows-3 gap-x-4 gap-y-2.5">
              {balanceSlots.map((balance, index) => (
                <div key={`balance-${index}`} className="flex min-h-[22px] items-baseline">
                  {balance ? (
                    <dd className="font-mono text-sm font-semibold text-white">{balance}</dd>
                  ) : (
                    <dd className="text-sm text-transparent" aria-hidden>
                      —
                    </dd>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </Card>
  );
}
