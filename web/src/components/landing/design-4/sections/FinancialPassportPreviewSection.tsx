"use client";

import { BadgeCheck, Calendar, Download, FileText, TrendingUp } from "lucide-react";
import { exportSampleOfficialReportPdf } from "@/lib/reports/exportOfficialReportPdf";

const scores = [
  { label: "Financial Health", value: "89", suffix: "/ 100", accent: "text-btc-orange" },
  { label: "Reputation Score", value: "92", suffix: "/ 100", accent: "text-btc-orange" },
  { label: "Income Stability", value: "92", suffix: "/ 100", accent: "text-btc-gold" }
];

const meta = [
  { label: "Loan Capacity", value: "$1,800 – $2,400", icon: TrendingUp },
  { label: "Wallet Age", value: "2 Years 4 Months", icon: Calendar },
  { label: "Transaction Activity", value: "312 Transactions", icon: FileText }
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
          Instead of asking for payslips and bank statements, Onfra generates a professional financial passport
          powered by blockchain activity — including a verified 6-month transaction statement.
        </p>

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-void-surface shadow-[0_0_60px_-15px_rgba(247,147,26,0.2)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 md:px-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">Onfra Report</p>
                <p className="mt-1 font-mono text-sm text-btc-orange">0xe3B6...A057</p>
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

          <button
            type="button"
            onClick={() => void exportSampleOfficialReportPdf()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-btc-orange px-5 py-3 text-sm font-bold text-white transition hover:bg-btc-orange/90"
          >
            <Download size={16} />
            Download Sample Report
          </button>
          <p className="mt-3 text-center font-mono text-[10px] text-stardust">
            Includes verification code, proof of income, and 6-month transaction statement
          </p>
        </div>
      </div>
    </section>
  );
}
