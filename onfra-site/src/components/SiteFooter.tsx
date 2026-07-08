import Link from "next/link";
import { LINKS } from "@/lib/links";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-4xl gap-10 px-5 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-nude-soft">OnFRA</p>
          <p className="mt-3 max-w-sm text-xs leading-6 text-ink-muted">
            Onchain Financial Reputation Agent — infrastructure for Celo wallets. ERC-8004 agent #9219.
          </p>
        </div>

        <div>
          <p className="label-accent font-medium">Product</p>
          <ul className="mt-3 space-y-2 text-xs text-ink-muted">
            <li>
              <a
                href={LINKS.app}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-nude-soft"
              >
                App
              </a>
            </li>
            <li>
              <Link
                href={LINKS.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-nude-soft"
              >
                Docs
              </Link>
            </li>
            <li>
              <Link href={LINKS.skills} className="transition hover:text-nude-soft">
                Skills
              </Link>
            </li>
            <li>
              <Link href={LINKS.pricing} className="transition hover:text-nude-soft">
                Pricing
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-accent font-medium">Ecosystem</p>
          <ul className="mt-3 space-y-2 text-xs text-ink-muted">
            <li>
              <a href={LINKS.agent8004} target="_blank" rel="noopener noreferrer" className="transition hover:text-nude-soft">
                8004scan
              </a>
            </li>
            <li>
              <a href={LINKS.mcp} target="_blank" rel="noopener noreferrer" className="transition hover:text-nude-soft">
                MCP manifest
              </a>
            </li>
            <li>
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="transition hover:text-nude-soft">
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
