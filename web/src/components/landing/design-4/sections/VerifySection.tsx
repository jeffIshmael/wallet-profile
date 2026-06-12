"use client";

import { FormEvent, useState } from "react";
import { BadgeCheck, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { VerificationGuide } from "@/components/VerificationGuide";
import type { VerifyResult } from "@/lib/verifyReport";
import { truncateAddress } from "@/lib/format";

export function VerifySection() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  async function handleVerify() {
    const trimmed = code.trim();
    if (!trimmed) {
      setResult({ valid: false });
      return;
    }

    setIsVerifying(true);
    setResult(null);

    try {
      const response = await fetch(`/api/agent/verify/${encodeURIComponent(trimmed)}`);
      const payload = (await response.json()) as VerifyResult & { valid: boolean };
      setResult(payload.valid ? payload : { valid: false });
    } catch {
      setResult({ valid: false });
    } finally {
      setIsVerifying(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void handleVerify();
  }

  return (
    <section className="bg-void-surface px-6 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-btc-orange">Verify report</p>
          <h1 className="mt-3 font-space text-3xl font-bold text-white md:text-4xl">
            Confirm a Chainalyse financial passport
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-stardust md:text-base">
            Paste the verification code from your PDF to confirm it was issued by Chainalyse and registered
            onchain.
          </p>
        </div>

        <ol className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-center font-mono text-[10px] uppercase tracking-widest text-stardust sm:gap-4">
          <li className="rounded-full border border-btc-orange/40 bg-btc-orange/10 px-3 py-1 text-btc-orange">
            1 · Locate code on PDF
          </li>
          <li className="hidden text-white/20 sm:inline">→</li>
          <li className="rounded-full border border-white/10 px-3 py-1">2 · Paste below</li>
          <li className="hidden text-white/20 sm:inline">→</li>
          <li className="rounded-full border border-white/10 px-3 py-1">3 · Verify onchain</li>
        </ol>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
          <div className="order-2 lg:order-1">
            <VerificationGuide />
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-28">
            <form onSubmit={onSubmit} className="rounded-2xl border border-white/10 bg-black/40 p-6 shadow-[0_0_40px_-16px_rgba(0,0,0,0.8)]">
              <label htmlFor="verification-code" className="font-mono text-[10px] uppercase tracking-widest text-stardust">
                Verification code
              </label>
              <p className="mt-1 text-xs text-stardust/80">
                Format: <span className="font-mono text-white/90">REP-XXXXXXXXXX</span> — or paste an IPFS CID from
                your report.
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <input
                  id="verification-code"
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setResult(null);
                  }}
                  placeholder="REP-ABC12XY9Z0"
                  autoComplete="off"
                  spellCheck={false}
                  className="min-h-[48px] w-full rounded-lg border border-white/10 bg-void px-4 font-mono text-sm text-white outline-none placeholder:text-white/30 focus:border-btc-orange/50 focus:shadow-[0_0_20px_-8px_rgba(247,147,26,0.4)]"
                />
                <button
                  type="submit"
                  disabled={isVerifying || !code.trim()}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-btc-orange px-6 py-2 font-mono text-xs font-medium uppercase tracking-wider text-white transition hover:bg-btc-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      Verify report
                    </>
                  )}
                </button>
              </div>
            </form>

            {result?.valid && (
              <div className="mt-6 rounded-2xl border border-btc-orange/40 bg-btc-orange/5 p-6">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-btc-orange/50 bg-btc-orange/15 text-btc-orange">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="flex items-center gap-2 font-space text-base font-semibold text-white">
                      <BadgeCheck size={16} className="text-btc-gold" />
                      Legitimate Chainalyse report
                    </p>
                    <p className="mt-2 text-sm leading-6 text-stardust">
                      Report ID{" "}
                      <span className="font-mono text-btc-orange">{result.reportId}</span> belongs to wallet{" "}
                      <span className="font-mono text-white">{truncateAddress(result.walletAddress, 6, 4)}</span>.
                    </p>
                    {result.source === "onchain" && (
                      <p className="mt-2 text-xs leading-5 text-stardust/80">
                        Verified on Celo mainnet
                        {result.reputationScore !== undefined && result.financialHealthScore !== undefined
                          ? ` · Reputation ${result.reputationScore}/100 · Health ${result.financialHealthScore}/100`
                          : ""}
                        {result.loanCapacity ? ` · Loan capacity ${result.loanCapacity}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {result && !result.valid && (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
                <XCircle size={18} className="mt-0.5 shrink-0 text-red-400" />
                <div>
                  <p className="text-sm font-medium text-white">Could not verify this code</p>
                  <p className="mt-1 text-sm text-stardust">
                    Check the code on your report — top metadata box or bottom footer — and try again.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
