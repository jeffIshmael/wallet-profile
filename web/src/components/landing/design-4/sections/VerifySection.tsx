"use client";

import { useState } from "react";
import { BadgeCheck, ShieldCheck, XCircle } from "lucide-react";
import { ReportCodeGuide } from "@/components/landing/design-4/sections/ReportCodeGuide";
import { verifyReportCode } from "@/lib/verifyReport";
import { truncateAddress } from "@/lib/format";

export function VerifySection() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<ReturnType<typeof verifyReportCode> | null>(null);

  function handleVerify() {
    setResult(verifyReportCode(code));
  }

  return (
    <section className="bg-void-surface px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">Verify report</p>
          <h2 className="mt-3 font-space text-3xl font-bold text-white md:text-4xl">
            Confirm a Wallet Profile financial passport
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-stardust md:text-base">
            Paste the verification code printed on your report to confirm it was issued by Wallet Profile.
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-start">
          <div>
            <div className="text-left">
              <label htmlFor="verification-code" className="font-mono text-[10px] uppercase tracking-widest text-stardust">
                Verification code
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <input
                  id="verification-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setResult(null);
                  }}
                  placeholder="WP-7A30EF182A4729CB"
                  className="min-h-[44px] flex-1 rounded-lg border border-white/10 bg-black/40 px-4 font-mono text-sm text-white outline-none placeholder:text-white/30 focus:border-btc-orange/50 focus:shadow-[0_0_20px_-8px_rgba(247,147,26,0.4)]"
                />
                <button
                  type="button"
                  onClick={handleVerify}
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-btc-orange px-6 py-2 font-mono text-xs font-medium uppercase tracking-wider text-white transition hover:bg-btc-orange/90"
                >
                  Verify
                </button>
              </div>
            </div>

            {result?.valid && (
              <div className="mt-8 rounded-2xl border border-btc-orange/40 bg-black/40 p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-btc-orange/50 bg-btc-orange/10 text-btc-orange">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="flex items-center gap-2 font-space text-base font-semibold text-white">
                      <BadgeCheck size={16} className="text-btc-gold" />
                      Legitimate Wallet Profile report
                    </p>
                    <p className="mt-2 text-sm leading-6 text-stardust">
                      This verification code is authentic. The report belongs to wallet{" "}
                      <span className="font-mono text-btc-orange">{truncateAddress(result.walletAddress, 6, 4)}</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {result && !result.valid && (
              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/40 p-5">
                <XCircle size={18} className="mt-0.5 shrink-0 text-btc-orange/80" />
                <p className="text-sm text-stardust">
                  We could not verify this code. Check the code on your report and try again.
                </p>
              </div>
            )}
          </div>

          <ReportCodeGuide />
        </div>
      </div>
    </section>
  );
}
