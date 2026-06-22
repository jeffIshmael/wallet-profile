import type { Metadata } from "next";
import Link from "next/link";
import { FooterSection } from "@/components/landing/design-4/sections/FooterSection";
import { PLATFORM_LINKS } from "@/lib/siteLinks";

export const metadata: Metadata = {
  title: "Support | Chainalyse",
  description: "Get help with the Chainalyse Mini App and wallet analysis features."
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-void font-inter text-white">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="font-dancing text-xl text-btc-orange transition hover:opacity-90">
            Chainalyse
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Support</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-space text-3xl font-bold">Support</h1>
        <p className="mt-4 text-sm leading-7 text-stardust">
          Chainalyse is an independent Mini App — not operated by MiniPay. We aim to respond to critical issues within
          24 hours during active program periods.
        </p>

        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <h2 className="font-space text-lg font-semibold text-white">Message us on X</h2>
            <p className="mt-2 text-sm text-stardust">
              Fastest channel for bugs, payment issues, and submission questions.
            </p>
            <a
              href={PLATFORM_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-full bg-btc-orange/80 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-btc-orange"
            >
              {PLATFORM_LINKS.xHandle}
            </a>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <h2 className="font-space text-lg font-semibold text-white">Documentation</h2>
            <p className="mt-2 text-sm text-stardust">Setup, MiniPay testing, and feature overview.</p>
            <a
              href={PLATFORM_LINKS.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex text-sm font-semibold text-btc-orange hover:underline"
            >
              View docs on GitHub
            </a>
          </section>

          <section className="rounded-2xl border border-white/10 bg-black/40 p-6">
            <h2 className="font-space text-lg font-semibold text-white">Common topics</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stardust">
              <li>Wallet not connecting — open Chainalyse inside the MiniPay app (auto-connect).</li>
              <li>Paid query failed — ensure you have enough USDT; deposit in MiniPay if needed.</li>
              <li>Dashboard empty — tap Dashboard and run your first wallet analysis.</li>
              <li>Report verification — use the Verify tab with the code from your PDF.</li>
            </ul>
          </section>

          <p className="text-xs text-stardust/80">
            See also our <Link href="/terms" className="text-btc-orange hover:underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-btc-orange hover:underline">Privacy Policy</Link>.
          </p>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
