const steps = [
  {
    title: "Connect Your Wallet",
    description: "Securely connect your wallet and allow Wallet Profile to analyze your onchain financial history."
  },
  {
    title: "OnFRA Analyzes Activity",
    description:
      "Our AI agent evaluates wallet activity on the Celo network only — income patterns, savings behavior, wallet maturity and financial consistency."
  },
  {
    title: "Generate Financial Scores",
    description: "Receive Financial Health, Reputation, Income Stability and Loan Capacity insights."
  },
  {
    title: "Download Your Financial Passport",
    description: "Generate a verified report including transaction statements, financial scores and borrowing recommendations."
  }
];

type TimelineCardProps = {
  title: string;
  description: string;
  align: "left" | "right";
};

function TimelineCard({ title, description, align }: TimelineCardProps) {
  return (
    <div
      className={`relative rounded-xl border border-btc-orange/40 bg-void-surface p-6 backdrop-blur-sm transition-all duration-300 hover:border-btc-orange/70 hover:shadow-[0_0_30px_-10px_rgba(247,147,26,0.2)] ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      <div className="pointer-events-none absolute -left-px -top-px h-5 w-5 border-l-2 border-t-2 border-btc-orange" />
      <div className="pointer-events-none absolute -bottom-px -right-px h-5 w-5 border-b-2 border-r-2 border-btc-orange" />
      <h3 className="font-space text-lg font-semibold text-white">{title}</h3>
      <p className={`mt-2 text-sm leading-6 text-stardust ${align === "right" ? "md:ml-auto md:max-w-[90%]" : ""}`}>
        {description}
      </p>
    </div>
  );
}

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-t border-white/10 bg-black px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-btc-orange">How it works</p>
        <h2 className="mt-3 text-center font-space text-3xl font-bold text-white md:text-4xl">
          From wallet activity to lender-ready proof of income
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-stardust md:text-base">
          Wallet Profile transforms years of blockchain activity into a professional financial profile that lenders can
          understand.
        </p>

        <div className="relative mx-auto mt-16 max-w-4xl">
          <div
            aria-hidden
            className="absolute bottom-12 left-1/2 top-12 w-px -translate-x-1/2 bg-gradient-to-b from-btc-orange via-btc-orange/70 to-btc-orange/20"
          />

          <div className="flex flex-col gap-20 md:gap-24">
            {steps.map((step, i) => {
              const isLeft = i % 2 === 0;

              return (
                <div key={step.title} className="relative min-h-[120px]">
                  <div className="absolute left-1/2 top-1/2 z-20 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-btc-orange bg-void-surface font-mono text-sm font-medium text-btc-orange shadow-[0_0_24px_rgba(247,147,26,0.35)]">
                    {i + 1}
                  </div>

                  <div
                    className={`relative z-10 mx-auto w-full max-w-md pt-14 md:absolute md:top-1/2 md:w-[calc(50%-2.5rem)] md:max-w-none md:-translate-y-1/2 md:pt-0 ${
                      isLeft ? "md:left-0 md:pr-10" : "md:left-auto md:right-0 md:pl-10"
                    }`}
                  >
                    <TimelineCard
                      title={step.title}
                      description={step.description}
                      align={isLeft ? "left" : "right"}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
