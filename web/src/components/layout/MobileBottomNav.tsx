"use client";

import { Bot, Home, LayoutDashboard, ReceiptText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { clsx } from "clsx";
import { Fragment } from "react";

const NAV_ITEMS = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "verify", label: "Verify", href: "/verify", icon: ShieldCheck },
  { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, featured: true },
  { id: "chat", label: "Agent chat", href: "/dashboard?chat=1", icon: Bot, badge: "New" },
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

function NavDivider() {
  return <div className="w-px shrink-0 self-center bg-white/10" style={{ height: "2rem" }} aria-hidden />;
}

type NavItem = (typeof NAV_ITEMS)[number];

function StandardNavLink({
  item,
  active
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={clsx(
        "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 transition",
        active ? "text-btc-orange" : "text-stardust hover:text-white"
      )}
    >
      {"badge" in item && item.badge && (
        <span className="absolute right-0 top-0 z-20 rounded-md bg-btc-orange px-1 py-0.5 text-[7px] font-bold uppercase leading-none tracking-wide text-white">
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

function FeaturedDashboardLink({ active }: { active: boolean }) {
  const Icon = LayoutDashboard;

  return (
    <Link
      href="/dashboard"
      className="relative flex min-w-0 flex-1 flex-col items-center gap-1 px-1 pb-1 pt-0"
      aria-current={active ? "page" : undefined}
    >
      <span
        className={clsx(
          "relative z-10 -mt-5 grid h-14 w-14 place-items-center rounded-full border-2 shadow-[0_0_24px_-4px_rgba(247,147,26,0.55)] transition",
          active
            ? "border-btc-orange bg-btc-orange text-white"
            : "border-btc-orange/50 bg-void-surface text-btc-orange hover:border-btc-orange hover:bg-btc-orange/15"
        )}
      >
        <Icon size={26} strokeWidth={2.25} />
        {active && (
          <span className="absolute inset-0 rounded-full ring-2 ring-btc-orange/30 ring-offset-2 ring-offset-black/90" />
        )}
      </span>
      <span
        className={clsx(
          "relative z-10 max-w-full truncate text-[9px] font-semibold leading-tight",
          active ? "text-btc-orange" : "text-stardust"
        )}
      >
        Dashboard
      </span>
    </Link>
  );
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
      <div className="mx-auto flex max-w-lg items-end px-2 pt-2">
        {NAV_ITEMS.map((item, index) => {
          const active = isActive(item.id, pathname, chatOpen);

          return (
            <Fragment key={item.id}>
              {index > 0 && <NavDivider />}
              {"featured" in item && item.featured ? (
                <FeaturedDashboardLink active={active} />
              ) : (
                <StandardNavLink item={item} active={active} />
              )}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}
