import Link from "next/link";
import { LINKS } from "@/lib/links";

export function SiteFooter() {
  return (
    <footer className="border-t border-purple-100/80 bg-[#FAF9FD] text-slate-800">
      <div className="mx-auto grid max-w-5xl gap-10 px-5 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 text-white shadow-sm">
              <img src="/logo_dark.png" alt="OnFRA" className="h-full w-full rounded-full object-cover" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">OnFRA</span>
          </div>
          <p className="mt-4 max-w-sm text-xs leading-6 text-slate-600">
            OnFRA turns supported onchain wallet activity into clear transaction records, financial reports and financial insights.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-purple-200/80 bg-purple-50/70 px-3 py-1 text-[11px] font-semibold text-purple-700">
            <span>Celo Mainnet</span>
            <span className="text-purple-300">·</span>
            <span>ERC-8004 Agent ID #9219</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Product</p>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
            <li>
              <Link href="/#how-it-works" className="transition hover:text-purple-600">
                How it works
              </Link>
            </li>
            <li>
              <Link href="/#features" className="transition hover:text-purple-600">
                Features
              </Link>
            </li>
            <li>
              <Link href={LINKS.pricing} className="transition hover:text-purple-600">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="transition hover:text-purple-600">
                FAQ
              </Link>
            </li>
            <li>
              <a
                href={LINKS.app}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-purple-600 transition hover:text-purple-700"
              >
                Open OnFRA App ↗
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Developers</p>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
            <li>
              <Link href={LINKS.docs} className="transition hover:text-purple-600">
                Documentation
              </Link>
            </li>
            <li>
              <Link href={LINKS.skills} className="transition hover:text-purple-600">
                Agent skills
              </Link>
            </li>
            <li>
              <a href={LINKS.capabilities} target="_blank" rel="noopener noreferrer" className="transition hover:text-purple-600">
                API capabilities
              </a>
            </li>
            <li>
              <a href={LINKS.mcp} target="_blank" rel="noopener noreferrer" className="transition hover:text-purple-600">
                MCP manifest
              </a>
            </li>
            <li>
              <a href={LINKS.agentCard} target="_blank" rel="noopener noreferrer" className="transition hover:text-purple-600">
                Agent card
              </a>
            </li>
            <li>
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer" className="transition hover:text-purple-600">
                GitHub
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-900">Transparency</p>
          <ul className="mt-4 space-y-2.5 text-xs text-slate-600">
            <li>
              <a
                href={LINKS.agent8004}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-purple-600"
              >
                8004scan profile
              </a>
            </li>
            <li>
              <a
                href="https://celoscan.io/address/0xE7621aF5dE3806ba26115bdC89190c65ed835C21"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-purple-600"
              >
                OnchainReporter
              </a>
            </li>
            <li>
              <a
                href="https://celo.org"
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-purple-600"
              >
                Celo Network
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-purple-100 py-6 bg-white/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>© {new Date().getFullYear()} OnFRA. All rights reserved.</p>
          <p className="font-mono text-[11px] text-slate-400">Analysis based on publicly available onchain activity.</p>
        </div>
      </div>
    </footer>
  );
}
