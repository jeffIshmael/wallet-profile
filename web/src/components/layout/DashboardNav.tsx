"use client";

import { LayoutDashboard, LogOut, ReceiptText,  } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";
import { Tooltip } from "@/components/ui/Tooltip";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { clearAnalysisSession } from "@/lib/dashboardSession";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/statements", label: "Transaction Statements", icon: ReceiptText }
];

export function DashboardNav({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useWalletAuth();

  function handleDisconnect() {
    clearAnalysisSession();
    logout();
    router.push("/");
  }

  return (
    <nav
      className={
        compact
          ? "flex items-center gap-1"
          : "flex h-full flex-col items-center justify-between gap-1.5"
      }
    >
      <div className={compact ? "flex gap-1" : "flex flex-col items-center gap-1.5"}>
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Tooltip key={href} label={label}>
              <Link
                href={href}
                className={clsx(
                  "relative grid h-10 w-10 place-items-center rounded-xl transition",
                  active
                    ? "bg-btc-orange/15 text-btc-orange before:absolute before:-left-3 before:top-1/2 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-btc-orange"
                    : "text-stardust hover:bg-white/5 hover:text-white"
                )}
                aria-label={label}
              >
                <Icon size={18} />
              </Link>
            </Tooltip>
          );
        })}
      </div>

      <Tooltip label="Disconnect wallet">
        <button
          type="button"
          onClick={handleDisconnect}
          className="grid h-10 w-10 place-items-center rounded-xl text-stardust transition hover:bg-danger/10 hover:text-danger"
          aria-label="Disconnect wallet"
        >
          <LogOut size={18} />
        </button>
      </Tooltip>
    </nav>
  );
}
