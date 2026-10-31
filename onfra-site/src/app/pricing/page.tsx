import { PageShell } from "@/components/PageShell";

const TIERS = [
  {
    name: "Lender screen",
    price: "0.01",
    unit: "USDT / screen",
    desc: "Underwriting screen for an external wallet address.",
    features: ["Trustworthiness indicator", "Average monthly income", "Estimated loan capacity range"]
  },
  {
    name: "Full analysis",
    price: "0.01",
    unit: "USDT / query",
    desc: "Complete wallet financial analysis for external addresses.",
    features: ["All reputation scores", "3-month statement history", "AI summary"]
  },
  {
    name: "Verified passport",
    price: "0.10",
    unit: "USDT / report",
    desc: "Verifiable PDF passport with onchain REP-{id}.",
    features: ["IPFS report archival", "OnchainReporter attestation", "Third-party lender verification"]
  },
  {
    name: "Verify passport",
    price: "Free",
    unit: "",
    desc: "Lenders and third parties verify REP-{id} reports without payment.",
    features: ["Onchain validity check", "Score summary", "Contract lookup"]
  }
] as const;

export default function PricingPage() {
  return (
    <PageShell active="/pricing">
      <div className="pt-8">
        <p className="label-accent font-bold text-xs uppercase tracking-wider text-purple-600">Pricing</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Pay per request</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-600">
          No monthly subscriptions. Micro-settlements in USDT on Celo via x402. Analyze your own wallet for free anytime in the app.
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <div key={tier.name} className="card-lift p-6 border border-purple-100 bg-white">
              <h2 className="text-base font-bold text-purple-700">{tier.name}</h2>
              <p className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900">{tier.price}</span>
                {tier.unit && <span className="text-xs font-medium text-slate-500">{tier.unit}</span>}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{tier.desc}</p>
              <ul className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-purple-500">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
