import Link from "next/link";
import { footerLinks } from "@/lib/siteLinks";

export function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-dancing text-xl text-btc-orange">Wallet Analyst</p>
          <p className="mt-1 font-mono text-xs text-stardust">© {year} Wallet Analyst. All rights reserved.</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {footerLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                href={link.href}
                className="font-mono text-xs text-stardust transition hover:text-white"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="font-mono text-xs text-stardust transition hover:text-white"
              >
                {link.label}
              </a>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}
