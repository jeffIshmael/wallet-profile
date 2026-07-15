export type DocsNavItem = {
  title: string;
  href: string;
};

export type DocsNavSection = {
  title: string;
  items: DocsNavItem[];
};

export const DOCS_NAV: DocsNavSection[] = [
  {
    title: "Overview",
    items: [
      { title: "Getting started", href: "/docs" },
      { title: "Install skill", href: "/docs/install" }
    ]
  },
  {
    title: "Integrate",
    items: [
      { title: "REST API", href: "/docs/rest-api" },
      { title: "Lender screening", href: "/docs/lenders" },
      { title: "Signal endpoints", href: "/docs/signals" },
      { title: "x402 payments", href: "/docs/x402" },
      { title: "Onchain & Attribution", href: "/docs/onchain" }
    ]
  },
  {
    title: "Agents",
    items: [
      { title: "MCP", href: "/docs/agents" },
      { title: "A2A", href: "/docs/agents/a2a" },
      { title: "JSON schemas", href: "/docs/schemas" }
    ]
  }
];

export type TocItem = {
  id: string;
  title: string;
  depth?: 2 | 3;
};
