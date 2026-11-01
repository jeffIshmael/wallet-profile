"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Check, Mail, Search, Wallet } from "lucide-react";
import { OnfraLogoLockup } from "@/components/layout/OnfraLogoLockup";
import { useWalletAuth } from "@/hooks/useWalletAuth";
import { isEvmAddress } from "@/lib/walletAddress";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type AuthButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  variant?: "primary" | "secondary";
};

function AuthButton({ onClick, disabled, icon, label, variant = "secondary" }: AuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={
        variant === "primary"
          ? "flex w-full items-center justify-center gap-3 rounded-full bg-[#111017] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#564870]/20 transition hover:bg-[#2a2733] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          : "flex w-full items-center justify-center gap-3 rounded-full border border-[#d4cee1] bg-white px-5 py-3.5 text-sm font-bold text-[#111017] shadow-sm transition hover:border-[#b7aedb] hover:bg-[#f3f1f8] active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
      }
    >
      {icon}
      {label}
    </button>
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

type SignInScreenProps = {
  /** Called with a valid wallet address when the visitor chooses "Analyze wallet". */
  onAnalyze: (wallet: string) => void;
  initialWallet?: string;
  initialError?: string;
};

export function SignInScreen({ onAnalyze, initialWallet = "", initialError = "" }: SignInScreenProps) {
  const {
    ready,
    loginWithGoogle,
    loginWithEmail,
    loginWithWallet,
    connectingMiniPay,
    miniPay,
    privyEnabled
  } = useWalletAuth();
  const busy = !ready || connectingMiniPay;

  const [wallet, setWallet] = useState(initialWallet);
  const [error, setError] = useState(initialError);
  const isValid = isEvmAddress(wallet);

  function handleAnalyze(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return; // also blocks the Enter key
    setError("");
    onAnalyze(wallet.trim());
  }

  return (
    <div className="entry-bg relative flex min-h-screen flex-col overflow-hidden font-inter text-[#111017]">
      <div className="entry-pattern" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-white/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-48 h-96 w-96 rounded-full bg-[#b7aedb]/25 blur-3xl" />

      {/* Header: logo + back to site */}
      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <OnfraLogoLockup />
        <a
          href={SITE_URL}
          className="rounded-full border border-[#111017]/15 bg-white/40 px-4 py-2 text-xs font-semibold transition hover:bg-white/70"
        >
          Back to site
        </a>
      </header>

      {/* One card */}
      <main className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 pb-12 pt-4">
        <div className="rounded-3xl border border-white/70 bg-white p-6 shadow-2xl shadow-[#564870]/20 sm:p-8">
          {/* Analyze */}
          <form onSubmit={handleAnalyze} noValidate>
            <p className="text-sm font-bold">Analyze a wallet</p>
            <p className="mt-1 text-xs leading-5 text-[#5f5c67]">
              Paste any public Celo address. No signup needed.
            </p>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#564870]" />
              <label htmlFor="wallet-input" className="sr-only">
                Celo wallet address
              </label>
              <input
                id="wallet-input"
                value={wallet}
                onChange={(e) => {
                  setWallet(e.target.value);
                  if (error) setError("");
                }}
                placeholder="0x… wallet address"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "wallet-error" : undefined}
                className={`w-full rounded-2xl border bg-[#f3f1f8] py-3.5 pl-10 pr-4 font-mono text-xs text-[#111017] outline-none transition placeholder:text-[#8f889e] focus:border-[#564870] focus:bg-white focus:ring-4 focus:ring-[#564870]/10 ${
                  error ? "border-rose-400" : "border-[#d4cee1]"
                }`}
              />
            </div>
            {error && !isValid && (
              <p id="wallet-error" role="alert" className="mt-2 text-xs font-medium text-rose-600">
                {error}
              </p>
            )}
            {isValid && (
              <p role="status" className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                Verified address
              </p>
            )}
            <button
              type="submit"
              disabled={!isValid}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#564870] px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-[#564870]/25 transition hover:bg-[#43385a] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:bg-[#564870] disabled:active:scale-100"
            >
              <span>Analyze wallet</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3" role="separator" aria-label="or">
            <span className="h-px flex-1 bg-[#d4cee1]" />
            <span className="text-xs font-semibold text-[#8f889e]">or</span>
            <span className="h-px flex-1 bg-[#d4cee1]" />
          </div>

          {/* Sign up */}
          <div>
            <p className="text-sm font-bold">Sign up to keep your history</p>
            <p className="mt-1 text-xs leading-5 text-[#5f5c67]">
              {miniPay
                ? "MiniPay will connect your wallet automatically."
                : "Your analyses and reports are saved to your account."}
            </p>

            <div className="mt-4 flex flex-col gap-3">
              {privyEnabled && (
                <>
                  <AuthButton
                    variant="primary"
                    disabled={busy}
                    onClick={loginWithGoogle}
                    icon={<GoogleIcon />}
                    label={busy ? "Loading…" : "Continue with Google"}
                  />
                  <AuthButton
                    disabled={busy}
                    onClick={loginWithEmail}
                    icon={<Mail size={18} className="text-[#564870]" />}
                    label="Continue with Email"
                  />
                </>
              )}
              <AuthButton
                variant={privyEnabled ? "secondary" : "primary"}
                disabled={busy}
                onClick={loginWithWallet}
                icon={<Wallet size={18} className={privyEnabled ? "text-[#564870]" : "text-white"} />}
                label={miniPay && connectingMiniPay ? "Connecting MiniPay…" : "Connect wallet"}
              />
            </div>

            <p className="mt-5 text-center text-[10px] leading-5 text-[#6f6b7a]">
              By continuing you agree to analyze your connected wallet on Celo.{" "}
              <a href="/terms" className="font-semibold text-[#564870] hover:underline">
                Terms
              </a>
              {" · "}
              <a href="/privacy" className="font-semibold text-[#564870] hover:underline">
                Privacy
              </a>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[#4a4655]">
          For OnFRA integration?{" "}
          <a href={SITE_URL} className="font-bold text-[#564870] hover:underline">
            OnFRA for developers →
          </a>
        </p>
        <p className="mt-3 text-center font-mono text-[10px] leading-5 text-[#6f6b7a]">
          Agents:{" "}
          <a href="/.well-known/mcp.json" className="text-[#564870] hover:underline">
            mcp.json
          </a>
          {" · "}
          <a href="/.well-known/agent-card.json" className="text-[#564870] hover:underline">
            agent-card
          </a>
          {" · "}
          <a href="/api/capabilities" className="text-[#564870] hover:underline">
            capabilities
          </a>
          {" · "}
          <a href="/SKILL.md" className="text-[#564870] hover:underline">
            SKILL.md
          </a>
        </p>
      </main>
    </div>
  );
}