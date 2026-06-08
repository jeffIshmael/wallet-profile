import { Bot } from "lucide-react";

const capabilities = [
  "Evaluates financial behavior",
  "Calculates reputation metrics",
  "Produces lender-ready attestations",
  "ERC-8004 compliant agent"
];

export function OnfraSection() {
  return (
    <section className="relative overflow-hidden bg-void-surface px-6 py-24">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-72 w-72 rounded-full bg-teal/10 blur-[150px]" />
      </div>
      <div className="relative mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-xl border border-teal/30 bg-teal/10">
          <Bot size={28} className="text-teal" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">Intelligence layer</p>
        <h2 className="mt-3 font-space text-3xl font-bold text-white md:text-4xl">Powered by OnFRA</h2>
        <p className="mt-2 font-mono text-xs text-stardust">Onchain Financial Reputation Agent · ERC-8004</p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {capabilities.map((cap) => (
            <span
              key={cap}
              className="rounded-full border border-teal/20 bg-teal/5 px-3 py-1.5 font-mono text-[10px] text-teal"
            >
              {cap}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
