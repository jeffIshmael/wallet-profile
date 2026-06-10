"use client";

import { Bot, Home, LayoutDashboard, ReceiptText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "verify", label: "Verify", href: "/verify", icon: ShieldCheck },
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { id: "chat", label: "Agent chat", href: "/dashboard?chat=1", icon: Bot },
  { id: "statements", label: "Statements", href: "/dashboard/statements", icon: ReceiptText }
] as const;

function isActive(id: (typeof NAV_ITEMS)[number]["id"], pathname: string, chatOpen: boolean): boolean {
  switch (id) {
    case "home":
      return pathname === "/";
    case "verify":
      return pathname === "/verify";
    case "dashboard":
      return pathname === "/dashboard" && !chatOpen;
    case "chat":
      return pathname.startsWith("/dashboard") && chatOpen;
    case "statements":
      return pathname.startsWith("/dashboard/statements");
    default:
      return false;
  }
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chatOpen = searchParams.get("chat") === "1";

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-black/90 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.id, pathname, chatOpen);
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={clsx(
                "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition",
                active ? "text-btc-orange" : "text-stardust hover:text-white"
              )}
            >
              {active && (
                <span className="absolute inset-x-2 top-1 h-8 rounded-lg bg-btc-orange/10" aria-hidden />
              )}
              <Icon size={20} className="relative z-10 shrink-0" strokeWidth={active ? 2.25 : 2} />
              <span className="relative z-10 max-w-full truncate text-[9px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
