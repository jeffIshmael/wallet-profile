"use client";

import { Mail, Wallet } from "lucide-react";
import { OnfraBrand } from "@/components/layout/OnfraBrand";
import { useWalletAuth } from "@/hooks/useWalletAuth";

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
          ? "flex w-full items-center justify-center gap-3 rounded-xl bg-btc-orange px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-btc-burnt disabled:cursor-wait disabled:opacity-60"
          : "flex w-full items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/5 px-5 py-3.5 text-sm font-semibold text-white transition hover:border-btc-orange/40 hover:bg-white/8 disabled:cursor-wait disabled:opacity-60"
      }
    >
      {icon}
      {label}
    </button>
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001";

export function SignInScreen() {
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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-5 py-12 font-inter text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(184,176,200,0.2), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(184,176,200,0.08), transparent)"
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(184,176,200,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(184,176,200,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center">
          <div className="flex justify-center">
            <OnfraBrand size="lg" theme="dark" />
          </div>
          <p className="mt-4 text-sm text-stardust">
            Onchain financial reputation for your Celo wallet
          </p>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-void-surface/90 p-6 shadow-[0_0_60px_-20px_rgba(184,176,200,0.25)] backdrop-blur-xl sm:p-8">
          <h1 className="text-center font-space text-xl font-semibold">Sign in to continue</h1>
          <p className="mt-2 text-center text-xs leading-6 text-stardust">
            {miniPay
              ? "MiniPay will connect your wallet automatically."
              : "Connect with Google, email, or your wallet to open your dashboard."}
          </p>

          <div className="mt-8 flex flex-col gap-3">
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
                  icon={<Mail size={18} className="text-btc-orange" />}
                  label="Continue with Email"
                />
              </>
            )}
            <AuthButton
              disabled={busy}
              onClick={loginWithWallet}
              icon={<Wallet size={18} className="text-btc-orange" />}
              label={miniPay && connectingMiniPay ? "Connecting MiniPay…" : "Connect Wallet"}
            />
          </div>

          <p className="mt-6 text-center text-[10px] leading-5 text-stardust">
            By continuing you agree to analyze your connected wallet on Celo.{" "}
            <a href="/terms" className="text-btc-orange hover:underline">
              Terms
            </a>
            {" · "}
            <a href="/privacy" className="text-btc-orange hover:underline">
              Privacy
            </a>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-stardust">
          Building a lending integration?{" "}
          <a href={SITE_URL} className="text-btc-orange hover:underline">
            OnFRA for lenders →
          </a>
        </p>
      </div>
    </div>
  );
}
