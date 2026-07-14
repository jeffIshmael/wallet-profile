import Link from "next/link";
import { FooterSection } from "@/components/landing/design-4/sections/FooterSection";

type LegalPageShellProps = {
  title: string;
  children: React.ReactNode;
};

export function LegalPageShell({ title, children }: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-void font-inter text-white">
      <header className="border-b border-white/10 px-6 py-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="font-dancing text-xl text-btc-orange transition hover:opacity-90">
            Onfra
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-widest text-stardust">{title}</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-space text-3xl font-bold">{title}</h1>
        <div className="prose-invert mt-8 space-y-4 text-sm leading-7 text-stardust">{children}</div>
      </main>

      <FooterSection />
    </div>
  );
}
