export function SolutionSection() {
  return (
    <section className="border-t border-white/10 bg-void-surface px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-stretch lg:gap-10">
          <div className="w-full max-w-xs shrink-0 rounded-2xl border border-white/10 bg-black/40 p-5 md:p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Wallet Profile</p>
            <p className="mt-3 font-mono text-lg text-btc-orange">0x7A3...91F</p>
            <ul className="mt-6 space-y-3 border-t border-white/10 pt-6">
              <li className="flex items-center gap-2 text-sm text-stardust">
                <span className="text-btc-orange">+</span> 1,247 Transactions
              </li>
              <li className="flex items-center gap-2 text-sm text-stardust">
                <span className="text-btc-orange">+</span> 18 Months Activity
              </li>
              <li className="flex items-center gap-2 text-sm text-stardust">
                <span className="text-btc-orange">+</span> Stablecoin Income
              </li>
            </ul>
            <p className="mt-6 rounded-xl border border-btc-orange/30 bg-btc-orange/5 px-3 py-3 text-center font-space text-base font-semibold text-white">
              Can this wallet qualify for a loan?
            </p>
          </div>

          <div aria-hidden className="hidden w-px shrink-0 self-stretch bg-white/10 lg:block" />

          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">The solution</p>
            <h2 className="mt-3 font-space text-3xl font-bold text-white md:text-4xl">
              Turning onchain wallet activity into{" "}
              <span className="text-btc-orange/60">financial reputation.</span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-stardust md:text-base">
              Wallet Profile analyzes onchain activity and transforms it into lender-ready financial insights, reputation
              scores, income verification and borrowing recommendations.
            </p>
            <p className="mt-4 text-sm leading-7 text-stardust md:text-base">
              Instead of asking users for payslips and bank statements, lenders can evaluate a wallet&apos;s financial
              behavior through transparent blockchain data.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
