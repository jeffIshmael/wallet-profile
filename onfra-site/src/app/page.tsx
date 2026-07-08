import Link from "next/link";
import { BuilderTerminal } from "@/components/BuilderTerminal";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroPreview } from "@/components/HeroVisual";
import { SiteNav } from "@/components/SiteNav";
import { LINKS } from "@/lib/links";
import { ArrowUpRight, FileIcon } from "lucide-react";

export default function HomePage() {
  return (
    <div className="page-shell text-ink">
      <main className="hero-ambient pb-0">
        <section className="section-black section-hero w-full">
          <SiteNav />
          <div className="hero-content mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
            <div className="animate-fade-up">
              <p className="label-accent text-[11px] font-medium sm:text-xs">ERC-8004 · Celo Mainnet</p>
              <h1 className="headline mt-5 text-[2.75rem] font-semibold leading-[1.12] text-ink sm:text-6xl md:text-7xl">
                On-chain financial
                <br />
                <span className="headline-accent">reputation agent</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl font-mono text-sm leading-8 tracking-tight text-ink-muted sm:text-base md:text-lg">
                OnFRA converts your wallet's on-chain activity on celo mainnet into financial reputation.
              </p>
              <ul className="mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-ink-faint sm:text-sm">
                {[
                  "Est. monthly income",
                  "Financial health score",
                  "Reputation score",
                  "Est. loan capacity",
                  "Transaction statements",
                  "Official financial reports",
                ].map((item, i) => (
                  <li key={item} className="flex items-center gap-2">
                    {i >= 0 && <span className="text-nude-muted/50">·</span>}
                    <span className="text-nude-muted">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={LINKS.apiDocs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary px-9 py-3.5 text-base flex items-center gap-2"
                >
                  View docs <FileIcon className="h-4 w-4" />
                </Link>
                <a
                  href={LINKS.app}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost px-9 py-3.5 text-base flex items-center gap-2"
                >
                  Try it out <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <HeroPreview />
        </section>

        <section className="section-pearl py-20">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent font-medium">What you get</p>
            <h2 className="headline mx-auto mt-4 max-w-lg text-2xl sm:text-3xl">
              A financial reputation from your wallet address
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-ink-muted">
              Connect your Celo wallet and OnFRA analyzes your public onchain
              activity to produce income estimates, financial health scores, reputation scores, transaction statements and a verified REP passport.
            </p>
            <div className="mt-12 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Onchain income", "Monthly estimates from inflows, outflows, and weekly patterns."],
                ["Financial health score", "Income, consistency, spending patterns and capacity rolled into one signal."],
                ["Reputation score", "How trustworthy your wallet is based on your onchain activity."],
                ["Est. loan capacity", "Amount you can borrow based on your income, financial health, and reputation."],
                ["Transaction statements", "Detailed statements of your wallet's onchain activity."],
                ["REP passport", "Verified financial report you can share or prove your income."],
                ["For you", "Generate your wallet's financial reputation by connecting it in the app."],
                ["For agents", "Query any address via REST, MCP, or A2A."],
                ["Open protocol", "x402 micropayments — pay per query, no subscriptions."]
              ].map(([title, body]) => (
                <div key={title} className="card-lift rounded-2xl p-5">
                  <h3 className="text-xs font-semibold">{title}</h3>
                  <p className="mt-2 text-xs leading-6 text-ink-muted">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-black py-20">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className="label-accent font-medium">For builders</p>
            <h2 className="headline mt-4 text-2xl sm:text-3xl">Install OnFRA in your agent</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
              Add the OnFRA skill to your agent, then explore the API for wallet reputation,
              income signals, and loan capacity.
            </p>
            <BuilderTerminal />
          </div>
        </section>

        <section className="section-black border-t border-white/6 py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
            <p className="label-accent text-[11px] font-medium sm:text-xs">Supported chains</p>
            <div className="mt-8 flex flex-col items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/celo_logo.jpg"
                alt="Celo"
                className="h-16 w-auto object-contain sm:h-20"
              />
              <span className="text-sm text-ink-muted sm:text-base">Celo Mainnet</span>
            </div>
          </div>
        </section>

        <section className="section-pearl py-16 text-center">
          <h2 className="headline text-2xl">Two surfaces, one engine</h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink-muted">
            <span className="font-medium text-nude-dark">app.onfra</span> — connect your wallet and
            build reputation.
            <br />
            <span className="font-medium text-nude-dark">onfra</span> — APIs, skills, and docs for
            builders and integrators.
          </p>
          <a
            href={LINKS.app}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-8 inline-flex px-8 py-3 text-sm"
          >
            Go to OnFRA App
          </a>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
