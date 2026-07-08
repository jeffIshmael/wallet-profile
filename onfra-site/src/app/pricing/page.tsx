import { PageShell } from "@/components/PageShell";

const TIERS = [
  {
    name: "Lender screen",
    price: "0.01",
    unit: "USDT / screen",
    desc: "Underwriting screen for a wallet address.",
    features: ["trustworthiness flag", "Average monthly income", "Loan capacity range"]
  },
  {
    name: "Full analysis",
    price: "0.01",
    unit: "USDT / query",
    desc: "Complete wallet analysis for external addresses.",
    features: ["All scores", "3-month statement", "AI summary"]
  },
  {
    name: "Verified passport",
    price: "0.10",
    unit: "USDT / report",
    desc: "PDF passport with onchain REP-{id}.",
    features: ["IPFS report", "OnchainReporter", "Lender verification"]
  },
  {
    name: "Verify passport",
    price: "Free",
    unit: "",
    desc: "Lenders verify REP-{id} without payment.",
    features: ["Onchain check", "Score summary", "Contract lookup"]
  }
] as const;

export default function PricingPage() {
  return (
    <PageShell active="/pricing">
      <p className="label-accent font-semibold">Pricing</p>
      <h1 className="mt-2 text-2xl font-semibold">Pay per request</h1>
      <p className="mt-4 max-w-lg text-xs leading-6 text-ink-muted">
        No subscriptions. USDT on Celo via x402. Analyze your wallet for free in the app.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {TIERS.map((tier) => (
          <div key={tier.name} className="card-lift rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-nude">{tier.name}</h2>
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-semibold text-nude">{tier.price}</span>
              {tier.unit && <span className="text-[10px] text-ink-faint">{tier.unit}</span>}
            </p>
            <p className="mt-2 text-[11px] text-ink-muted">{tier.desc}</p>
            <ul className="mt-4 space-y-1.5 text-[11px] text-ink-muted">
              {tier.features.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
