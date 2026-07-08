"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOCS_NAV } from "@/lib/docsNav";
import { cn } from "@/lib/cn";

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="docs-sidebar">
      <nav className="docs-sidebar-nav">
        {DOCS_NAV.map((section) => (
          <div key={section.title} className="docs-sidebar-section">
            <p className="docs-sidebar-heading">{section.title}</p>
            <ul className="docs-sidebar-list">
              {section.items.map((item) => {
                const active =
                  item.href === "/docs"
                    ? pathname === "/docs"
                    : pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn("docs-sidebar-link", active && "docs-sidebar-link-active")}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
