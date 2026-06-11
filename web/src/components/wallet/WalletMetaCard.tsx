"use client";

import Link from "next/link";
import { Copy, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tooltip } from "@/components/ui/Tooltip";
import { WalletIdentityAvatar } from "@/components/wallet/WalletIdentityAvatar";
import { useWalletData } from "@/hooks/useWalletData";
import { copyWithToast } from "@/lib/copyToClipboard";
import { formatTokenBalance, formatUtc, formatWalletAge, truncateAddress } from "@/lib/format";

function daysSince(timestamp: string) {
  const diff = Date.now() - new Date(timestamp).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

const TOKEN_COLOR_CLASS: Record<string, string> = {
  USDC: "wallet-token-usdc",
  USDT: "wallet-token-usdt",
  USDm: "wallet-token-usdm",
  CELO: "wallet-token-celo"
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="wallet-section-label mb-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]">
      {children}
    </p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <dt className="wallet-field-label shrink-0 text-[10px]">{children}</dt>;
}

export function WalletMetaCard() {
  const { walletData } = useWalletData();
  if (!walletData) return null;

  const identity = [
    {
      label: "Wallet Address",
      value: truncateAddress(walletData.walletAddress, 8, 6),
      valueClass: "wallet-value-address"
    },
    { label: "ENS Name on Celo", value: walletData.ens, isEns: true, valueClass: "wallet-value-muted" },
    {
      label: "Wallet Age",
      value: formatWalletAge(walletData.walletAgeMonths),
      valueClass: "wallet-value-age"
    }
  ];

  const lastActiveDays = walletData.lastTransaction
    ? daysSince(walletData.lastTransaction.timestamp)
    : 0;

  const activity = [
    {
      label: "Total Txns on Celo",
      value: walletData.totalTransactions.toLocaleString(),
      valueClass: "wallet-value-tx-count"
    },
    {
      label: "First Tx on Celo",
      value: walletData.firstTransaction ? formatUtc(walletData.firstTransaction.timestamp) : "—",
      valueClass: "wallet-value-muted"
    },
    {
      label: "Last Tx on Celo",
      value: walletData.lastTransaction ? `${lastActiveDays} days ago` : "—",
      valueClass: "wallet-value-recent"
    }
  ];

  const balances = walletData.tokens.map(({ symbol, balance }) => ({
    label: formatTokenBalance(balance, symbol),
    colorClass: TOKEN_COLOR_CLASS[symbol] ?? "wallet-value-body"
  }));
  const balanceSlots = [...balances, null, null].slice(0, 6);

  const yearsActive = (walletData.walletAgeMonths / 12).toFixed(1);

  return (
    <Card compact className="h-full !py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <WalletIdentityAvatar address={walletData.walletAddress} size={40} />
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
            <p className="mt-1 text-[11px] leading-4">
              <span className="text-stardust">Active for </span>
              <span className="font-semibold text-btc-orange">{yearsActive} years</span>
              <span className="text-stardust"> · </span>
              <span className="wallet-value-body font-semibold">{walletData.totalTransactions} transactions</span>
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
          <div className="wallet-summary-section rounded-lg bg-white/[0.02] px-2 py-2 sm:bg-transparent sm:px-4 sm:py-0 lg:pl-0">
            <SectionLabel>Identity</SectionLabel>
            <dl className="space-y-2.5">
              {identity.map(({ label, value, isEns, valueClass }) => (
                <div key={label} className="flex min-h-[22px] items-baseline justify-between gap-3">
                  <FieldLabel>{label}</FieldLabel>
                  <dd className="text-right">
                    {label === "Wallet Address" ? (
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`text-sm font-semibold ${valueClass}`}>{value}</span>
                        <Tooltip label="Copy wallet address">
                          <button
                            type="button"
                            onClick={() =>
                              void copyWithToast(walletData.walletAddress, "Wallet address copied")
                            }
                            className="text-stardust transition hover:text-btc-orange"
                            aria-label="Copy wallet address"
                          >
                            <Copy size={12} />
                          </button>
                        </Tooltip>
                      </span>
                    ) : isEns && !value ? (
                      <Link
                        href="https://names.celo.org/"
                        target="_blank"
                        rel="noreferrer"
                        className="ens-register-link inline-flex items-center gap-1 rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-300 transition hover:border-violet-400/50 hover:bg-violet-500/20"
                      >
                        Register ENS
                        <ExternalLink size={10} />
                      </Link>
                    ) : (
                      <span className={`text-sm font-semibold ${valueClass}`}>{value ?? "None registered"}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="wallet-summary-section rounded-lg bg-white/[0.02] px-2 py-4 sm:bg-transparent sm:px-4 sm:py-0 lg:py-0">
            <SectionLabel>Activity</SectionLabel>
            <dl className="space-y-2.5">
              {activity.map(({ label, value, valueClass }) => (
                <div key={label} className="flex min-h-[22px] items-baseline justify-between gap-3">
                  <FieldLabel>{label}</FieldLabel>
                  <dd className={`text-right text-sm font-semibold ${valueClass}`}>{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="wallet-summary-section rounded-lg bg-white/[0.02] px-2 py-4 sm:col-span-2 sm:bg-transparent sm:px-4 sm:py-0 lg:col-span-2 lg:pr-0">
            <SectionLabel>Balances</SectionLabel>
            <dl className="grid grid-cols-2 grid-rows-3 gap-x-4 gap-y-2.5">
              {balanceSlots.map((balance, index) => (
                <div key={`balance-${index}`} className="flex min-h-[22px] items-baseline">
                  {balance ? (
                    <dd className={`text-sm font-semibold ${balance.colorClass}`}>{balance.label}</dd>
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
