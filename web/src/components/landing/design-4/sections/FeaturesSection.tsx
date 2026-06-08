"use client";

import { useState } from "react";
import { BadgeCheck, Bot, FileText, Landmark, Shield, TrendingUp } from "lucide-react";
import { ScoreOutputCards } from "@/components/landing/design-4/hero/ScoreOutputCards";

const features = [
  { icon: TrendingUp, title: "Financial Health Score", description: "Overall wallet strength from income, savings, and portfolio stability." },
  { icon: Shield, title: "Reputation Score", description: "Wallet maturity, transaction consistency, and trustworthiness." },
  { icon: BadgeCheck, title: "Income Verification", description: "Historical inflows and recurring payment patterns." },
  { icon: Landmark, title: "Loan Capacity", description: "AI estimate of sustainable borrowing range." },
  { icon: FileText, title: "Reputation Report", description: "Lender-ready PDF with scores and AI assessment." },
  { icon: Bot, title: "OnFRA Agent", description: "ERC-8004 intelligence layer for financial insight." }
];

export function FeaturesSection() {
  const [active, setActive] = useState(0);

  return (
    <section id="features" className="bg-void px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">Platform</p>
        <h2 className="mt-3 font-space text-3xl font-bold text-white md:text-4xl">
          Everything lenders need to say yes
        </h2>
        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          <div className="space-y-1">
            {features.map((feature, i) => (
              <button
                key={feature.title}
                type="button"
                onClick={() => setActive(i)}
                className={`group w-full rounded-xl px-4 py-3.5 text-left transition ${
                  active === i ? "border border-btc-orange/30 bg-btc-orange/5" : "border border-transparent hover:bg-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <feature.icon size={16} className={active === i ? "text-btc-orange" : "text-stardust"} />
                  <span className={`font-space text-sm font-semibold ${active === i ? "text-btc-orange" : "text-white"}`}>
                    {feature.title}
                  </span>
                </div>
                {active === i && (
                  <p className="mt-2 pl-7 text-sm leading-6 text-stardust">{feature.description}</p>
                )}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-void-surface p-6 shadow-[0_0_50px_-10px_rgba(247,147,26,0.1)]">
            <p className="font-mono text-[10px] uppercase tracking-wider text-stardust">Live preview</p>
            <div className="mt-4">
              <ScoreOutputCards />
            </div>
            <div className="mt-4 rounded-lg border border-teal/20 bg-teal/5 p-3">
              <p className="font-mono text-[10px] text-stardust">Loan range</p>
              <p className="font-mono text-sm text-teal">$2,400 – $4,800</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
