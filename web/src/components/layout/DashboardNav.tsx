"use client";

import { Bot, Home, LogOut, ReceiptText, Search, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { Tooltip } from "@/components/ui/Tooltip";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { useWalletData } from "@/hooks/useWalletData";

type NavItem = {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: "agent";
};

const items: NavItem[] = [
  { key: "home", label: "Home", icon: Home, href: "/dashboard" },
  { key: "analyze", label: "Analyze", icon: Search, href: "/dashboard/analyze" },
  { key: "statements", label: "Statements", icon: ReceiptText, href: "/dashboard/statements" },
  { key: "agent", label: "Agent", icon: Bot, action: "agent" }
];

type DashboardNavProps = {
  compact?: boolean;
  onChatOpen?: () => void;
};

export function DashboardNav({ compact = false, onChatOpen }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const addressParam = useSearchParams().get("address");
  const { logout } = useWalletAuth();
  const { clearWallet } = useWalletData();

  const hrefFor = (href: string) =>
    addressParam ? `${href}?address=${encodeURIComponent(addressParam)}` : href;

  function handleDisconnect() {
    clearWallet();
    logout();
    router.push("/");
  }

  // Full-width rows with labels on xl screens; icon rail below that
  const itemClass = (active: boolean) =>
    clsx(
      "relative flex h-10 w-10 items-center justify-center rounded-xl transition",
      !compact && "xl:w-full xl:justify-start xl:gap-3 xl:px-3",
      active
        ? "bg-btc-orange/15 text-btc-orange before:absolute before:-left-3 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-btc-orange xl:before:-left-2"
        : "text-stardust hover:bg-white/5 hover:text-white"
    );

  return (
    <nav
      className={
        compact
          ? "flex items-center gap-1"
          : "flex h-full w-full flex-col items-center justify-between gap-1.5 xl:items-stretch"
      }
    >
      <div className={compact ? "flex gap-1" : "flex flex-col items-center gap-1.5 xl:items-stretch"}>
        {items.map(({ key, label, icon: Icon, href, action }) => {
          const active =
            Boolean(href) &&
            (href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(href as string));
          const content = (
            <>
              <Icon size={18} className="shrink-0" />
              {!compact && <span className="hidden text-xs font-semibold xl:inline">{label}</span>}
            </>
          );

          return (
            <Tooltip key={key} label={label} side="right">
              {href ? (
                <Link href={hrefFor(href)} className={itemClass(active)} aria-label={label}>
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onChatOpen}
                  className={itemClass(false)}
                  aria-label={label}
                >
                  {content}
                </button>
              )}
            </Tooltip>
          );
        })}
      </div>

      <Tooltip label="Disconnect wallet" side="right">
        <button
          type="button"
          onClick={handleDisconnect}
          className={clsx(
            "flex h-10 w-10 items-center justify-center rounded-xl text-stardust transition hover:bg-danger/10 hover:text-danger",
            !compact && "xl:w-full xl:justify-start xl:gap-3 xl:px-3"
          )}
          aria-label="Disconnect wallet"
        >
          <LogOut size={18} className="shrink-0" />
          {!compact && <span className="hidden text-xs font-semibold xl:inline">Disconnect</span>}
        </button>
      </Tooltip>
    </nav>
  );
}