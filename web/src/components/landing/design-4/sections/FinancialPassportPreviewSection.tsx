import { BadgeCheck, Calendar, FileText, TrendingUp } from "lucide-react";

const scores = [
  { label: "Financial Health", value: "89", suffix: "/ 100", accent: "text-btc-orange" },
  { label: "Reputation Score", value: "92", suffix: "/ 100", accent: "text-btc-orange" },
  { label: "Income Stability", value: "86", suffix: "/ 100", accent: "text-btc-gold" }
];

const meta = [
  { label: "Loan Capacity", value: "KES 120,000", icon: TrendingUp },
  { label: "Wallet Age", value: "24 Months", icon: Calendar },
  { label: "Transaction Activity", value: "1,247 Transactions", icon: FileText }
];

export function FinancialPassportPreviewSection() {
  return (
    <section id="passport-preview" className="bg-black px-6 pb-24 pt-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-center font-mono text-[10px] uppercase tracking-widest text-btc-orange">
          Financial Passport Preview
        </p>
        <h2 className="mt-3 text-center font-space text-3xl font-bold text-white md:text-4xl">
          A report lenders can actually understand
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-7 text-stardust md:text-base">
          Instead of asking for payslips and bank statements, Wallet Profile generates a professional financial passport
          powered by blockchain activity.
        </p>

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-void-surface shadow-[0_0_60px_-15px_rgba(247,147,26,0.2)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 md:px-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Wallet Profile Report</p>
                <p className="mt-1 font-mono text-sm text-btc-orange">0x7A3...91F</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-btc-gold/30 bg-btc-gold/10 px-3 py-1.5">
                <BadgeCheck size={14} className="text-btc-gold" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-btc-gold">Verified by OnFRA</span>
              </div>
            </div>

            <div className="grid gap-px bg-white/5 md:grid-cols-3">
              {scores.map((score) => (
                <div key={score.label} className="bg-void-surface px-6 py-6 md:px-8">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-stardust">{score.label}</p>
                  <p className={`mt-2 font-mono text-3xl font-medium ${score.accent}`}>
                    {score.value}
                    <span className="text-lg text-stardust">{score.suffix}</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-px border-t border-white/5 bg-white/5 sm:grid-cols-3">
              {meta.map((item) => (
                <div key={item.label} className="flex items-start gap-3 bg-void-surface px-6 py-5 md:px-8">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-btc-burnt/50 bg-btc-burnt/20 text-btc-orange">
                    <item.icon size={14} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-stardust">{item.label}</p>
                    <p className="mt-1 font-mono text-sm font-medium text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
