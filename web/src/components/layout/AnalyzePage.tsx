"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, BarChart3, Check, Search } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { truncateAddress } from "@/lib/format";
import { isEvmAddress } from "@/lib/walletAddress";
import { addRecentWallet, getRecentWallets, timeAgo, type RecentWallet } from "@/lib/recentWallets";

function AnalyzeContent() {
  const router = useRouter();
  const { address: ownAddress } = useWalletAuth();
  const [wallet, setWallet] = useState("");
  const [recent, setRecent] = useState<RecentWallet[]>([]);
  const isValid = isEvmAddress(wallet);

  useEffect(() => {
    setRecent(getRecentWallets());
  }, []);

  const hrefFor = (address: string) =>
    ownAddress && ownAddress.toLowerCase() === address.toLowerCase()
      ? "/dashboard"
      : `/dashboard?address=${encodeURIComponent(address)}`;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    const address = wallet.trim();
    addRecentWallet(address);
    router.push(hrefFor(address));
  }

  return (
    <div className="mx-auto w-full max-w-2xl pb-6">
      <h1 className="font-space text-2xl font-semibold text-white sm:text-3xl">Analyze a wallet</h1>
      <p className="mt-1 text-sm text-stardust">Paste any wallet address to understand its activity.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-5">
        <label htmlFor="analyze-wallet-input" className="sr-only">
          Wallet address
        </label>
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-void-surface p-2 focus-within:border-btc-orange/40">
          <Search size={16} className="ml-2 shrink-0 text-btc-orange" />
          <input
            id="analyze-wallet-input"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            placeholder="0x… wallet address"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-1 py-2 font-mono text-xs text-white outline-none placeholder:text-stardust/70"
          />
          {/* Celo is the only supported network for now, so this is a label, not a picker */}
          <span
            title="More networks coming soon"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-black/20 px-2.5 py-2 text-[11px] font-semibold text-white"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#f5b862]" />
            Celo
          </span>
        </div>

        {isValid && (
          <p role="status" className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-success">
            <Check size={13} strokeWidth={3} />
            Verified address
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid}
          className="report-btn-primary mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-btc-orange px-4 py-3.5 text-sm font-bold text-void transition hover:bg-btc-orange/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze wallet
          <ArrowRight size={16} />
        </button>
      </form>

      <section className="mt-8">
        <h2 className="font-space text-sm font-semibold text-white">Recent activity</h2>
        {recent.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-white/10 bg-void-surface p-4 text-xs text-stardust">
            Wallets you analyze will show up here.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((item) => {
              const isOwn = ownAddress?.toLowerCase() === item.address;
              return (
                <li
                  key={item.address}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-void-surface p-3"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-btc-orange/10 text-btc-orange">
                    <BarChart3 size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {isOwn ? "Your wallet" : "Wallet analysis"}
                    </p>
                    <p className="truncate text-[11px] text-stardust">
                      <span className="font-mono">{truncateAddress(item.address, 6, 4)}</span> · {timeAgo(item.at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(hrefFor(item.address))}
                    className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-btc-orange/40"
                  >
                    View
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

type AnalyzePageProps = {
  chatOpen?: boolean;
  onChatOpenChange?: (open: boolean) => void;
};

export function AnalyzePage({ chatOpen, onChatOpenChange }: AnalyzePageProps) {
  return (
    <DashboardShell chatOpen={chatOpen} onChatOpenChange={onChatOpenChange} hideChatFab scrollable>
      <AnalyzeContent />
    </DashboardShell>
  );
}