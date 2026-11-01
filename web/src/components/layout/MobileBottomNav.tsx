"use client";

import { Bot, Home, ReceiptText, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { clsx } from "clsx";

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/dashboard", icon: Home },
  { id: "analyze", label: "Analyze", href: "/dashboard/analyze", icon: Search },
  { id: "chat", label: "Agent chat", href: "/chat", icon: Bot, badge: "New" },
  { id: "statements", label: "Statements", href: "/dashboard/statements", icon: ReceiptText }
] as const;

function isActive(id: (typeof NAV_ITEMS)[number]["id"], pathname: string): boolean {
  switch (id) {
    case "home":
      return pathname === "/dashboard";
    case "analyze":
      return pathname.startsWith("/dashboard/analyze");
    case "chat":
      return pathname === "/chat";
    case "statements":
      return pathname.startsWith("/dashboard/statements");
    default:
      return false;
  }
}

function NavDivider() {
  return <div className="w-px shrink-0 self-center bg-white/10" style={{ height: "2rem" }} aria-hidden />;
}

type NavItem = (typeof NAV_ITEMS)[number];

function StandardNavLink({
  item,
  href,
  active
}: {
  item: NavItem;
  href: string;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={href}
      className={clsx(
        "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition",
        active ? "text-btc-orange" : "text-stardust hover:text-white"
      )}
    >
      {"badge" in item && item.badge && (
        <span className="absolute right-0 top-0 z-20 rounded-md bg-btc-orange px-1 py-0.5 text-[7px] font-bold uppercase leading-none tracking-wide text-void">
          {item.badge}
        </span>
      )}

      {active && (
        <span className="absolute inset-x-1.5 top-1 h-8 rounded-lg bg-btc-orange/10" aria-hidden />
      )}

      <Icon size={20} className="relative z-10 shrink-0" strokeWidth={active ? 2.25 : 2} />
      <span className="relative z-10 max-w-full truncate text-[9px] font-medium leading-tight">
        {item.label}
      </span>
    </Link>
  );
}


export function MobileBottomNav() {
  const pathname = usePathname();
  const address = useSearchParams().get("address");

  // Guests viewing a pasted wallet keep that wallet when moving around the dashboard
  const hrefFor = (href: string) =>
    address && href.startsWith("/dashboard") ? `${href}?address=${encodeURIComponent(address)}` : href;

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-void/95 shadow-[0_-8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-lg items-end px-2 pt-2">
        {NAV_ITEMS.map((item, index) => {
          const active = isActive(item.id, pathname);

          return [
            index > 0 && <NavDivider key={`divider-${item.id}`} />,
            <StandardNavLink key={item.id} item={item} href={hrefFor(item.href)} active={active} />
          ];
        })}
      </div>
    </nav>
  );
}