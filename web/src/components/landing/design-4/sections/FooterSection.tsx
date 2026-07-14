import Link from "next/link";
import { footerLinks, PLATFORM_LINKS } from "@/lib/siteLinks";

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-dancing text-xl text-btc-orange">Onfra</p>
          <p className="mt-1 font-mono text-xs text-stardust">© {year} Onfra. All rights reserved.</p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-stardust transition hover:text-white"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="font-mono text-xs text-stardust transition hover:text-white"
              >
                {link.label}
              </Link>
            )
          )}

          <a
            href={PLATFORM_LINKS.x}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Onfra on X (${PLATFORM_LINKS.xHandle})`}
            className="flex flex-col items-center gap-1 text-stardust transition hover:text-white"
          >
            <XIcon className="h-4 w-4" />
            {/* <span className="font-mono text-[10px] leading-tight">{PLATFORM_LINKS.xHandle}</span> */}
          </a>
        </nav>
      </div>
    </footer>
  );
}
