import type { ReactNode } from "react";
import type { TocItem } from "@/lib/docsNav";
import { DocsHeader } from "@/components/docs/DocsContent";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { DocsToc } from "@/components/docs/DocsToc";
import { SiteFooter } from "@/components/SiteFooter";

type DocsShellProps = {
  children: ReactNode;
  toc?: TocItem[];
};

export function DocsShell({ children, toc = [] }: DocsShellProps) {
  return (
    <div className="docs-shell min-h-screen bg-black text-ink">
      <DocsHeader />
      <div className="docs-layout mx-auto max-w-[90rem]">
        <DocsSidebar />
        <main className="docs-main">{children}</main>
        <DocsToc items={toc} />
      </div>
      <SiteFooter />
    </div>
  );
}
