import { X } from "lucide-react";

const painPoints = [
  "Crypto payments don't appear on traditional bank statements",
  "Freelancers struggle to prove recurring income",
  "Lenders have no standard way to assess wallet reputation",
  "Years of financial history remain trapped inside blockchain data"
];

export function ProblemSection() {
  return (
    <section className="bg-void-surface px-6 pb-24 pt-8">
      <div className="mx-auto max-w-4xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">The problem</p>
        <h2 className="mt-3 font-space text-3xl font-bold leading-tight text-white md:text-4xl">
          Your wallet knows your income.
          <br />
          <span className="text-btc-orange">Your lender doesn&apos;t.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-stardust md:text-base">
          Millions of freelancers, remote workers, creators and DAO contributors receive payments in crypto every
          month. Yet when applying for loans, they are asked for bank statements, payslips and employment records
          that don&apos;t reflect their real financial activity.
        </p>
        <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-stardust md:text-base">
          As a result, reliable earners are often unable to prove their income despite having years of verifiable
          onchain history.
        </p>
        <div className="mx-auto mt-8 flex max-w-3xl flex-col text-left sm:flex-row sm:divide-x sm:divide-white/10">
          <ul className="flex-1 space-y-3 sm:pr-8">
            {painPoints.slice(0, 2).map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-stardust">
                <X size={14} className="mt-0.5 shrink-0 text-btc-orange/70" />
                {point}
              </li>
            ))}
          </ul>
          <ul className="mt-3 flex-1 space-y-3 sm:mt-0 sm:pl-8">
            {painPoints.slice(2).map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-stardust">
                <X size={14} className="mt-0.5 shrink-0 text-btc-orange/70" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
