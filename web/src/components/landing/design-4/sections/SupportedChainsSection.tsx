"use client";

import Image from "next/image";
import Link from "next/link";
import { Tooltip } from "@/components/ui/Tooltip";
import celoLogo from "@/public/celoLogo.jpg";

const ONFRA_AGENT_URL = "https://8004scan.io/agents/celo/9219";

const chains = [{ logo: celoLogo, alt: "Celo", comingSoon: false }];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">{children}</p>
  );
}

export function SupportedChainsSection() {
  return (
    <section id="supported-chains" className="border-t border-white/10 bg-void-surface py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-stretch px-6 sm:flex-row sm:items-center sm:justify-center">
        <div className="flex flex-1 flex-col items-center py-4 text-center sm:py-0">
          <SectionLabel>Supported chains</SectionLabel>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-10">
            {chains.map((chain) => (
              <div key={chain.alt} className="flex flex-col items-center gap-2">
                <Image
                  src={chain.logo}
                  alt={chain.alt}
                  width={300}
                  height={300}
                  className="h-20 w-auto object-contain"
                />
                {chain.comingSoon && (
                  <span className="rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-stardust">
                    Coming soon
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div aria-hidden className="mx-auto h-px w-full max-w-xs bg-white/10 sm:mx-0 sm:h-16 sm:w-px sm:max-w-none sm:shrink-0" />

        <div className="flex flex-1 flex-col items-center py-4 text-center sm:py-0">
          <SectionLabel>Powered by</SectionLabel>
          <div className="mt-6">
            <Tooltip label="ERC-8004 agent">
              <Link
                href={ONFRA_AGENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-2 transition hover:border-btc-orange/30 hover:bg-black/50"
                aria-label="OnFRA — ERC-8004 agent on 8004scan"
              >
                <Image
                  src="/agent_logo.png"
                  alt="OnFRA"
                  width={120}
                  height={120}
                  className="h-16 w-auto rounded-xl object-contain transition group-hover:brightness-110 md:h-20"
                />
              </Link>
            </Tooltip>
          </div>
        </div>
      </div>
    </section>
  );
}
