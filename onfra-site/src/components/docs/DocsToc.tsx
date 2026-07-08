"use client";

import type { TocItem } from "@/lib/docsNav";
import { cn } from "@/lib/cn";

export function DocsToc({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <aside className="docs-toc">
      <p className="docs-toc-heading">On this page</p>
      <ul className="docs-toc-list">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn("docs-toc-link", item.depth === 3 && "docs-toc-link-nested")}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
