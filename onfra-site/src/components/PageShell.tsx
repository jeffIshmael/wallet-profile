import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";

type PageShellProps = {
  active?: string;
  children: ReactNode;
};

export function PageShell({ active, children }: PageShellProps) {
  return (
    <div className="page-shell min-h-screen text-ink">
      <SiteNav active={active} />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-[calc(var(--site-header-height)+1.5rem)]">{children}</main>
      <SiteFooter />
    </div>
  );
}
