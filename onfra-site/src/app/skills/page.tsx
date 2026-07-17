import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { API_URL, LINKS } from "@/lib/links";

const TOOLS = [
  { name: "screen_wallet", route: "POST /api/lender/screen", desc: "Lender underwriting screen" },
  { name: "analyze_wallet", route: "POST /api/agent/analyze", desc: "Full financial analysis" },
  { name: "chat_query", route: "POST /api/agent/chat", desc: "Natural-language wallet queries" },
  { name: "generate_report", route: "POST /api/agent/report", desc: "Verified financial passport" },
  { name: "generate_statement", route: "POST /api/agent/statement", desc: "Generate transaction statement PDF" },
  { name: "verify_report", route: "GET /api/agent/verify/{id}", desc: "Verify REP-{id} onchain" }
] as const;

export default function SkillsPage() {
  return (
    <PageShell active="/skills">
      <p className="label-accent font-semibold">Agent skills</p>
      <h1 className="mt-2 text-2xl font-semibold">Install OnFRA</h1>
      <p className="mt-4 text-xs leading-6 text-ink-muted">
        ERC-8004 agent #9219 on Celo. Discover and invoke via MCP, A2A, or REST.
      </p>

      <div className="code-surface mt-8 rounded-2xl p-5">
        <p className="label-accent font-medium">Install for AI agents</p>
        <p className="mt-3 text-xs leading-6 text-ink-muted">
          Install the OnFRA skill to check wallet financial reputation from any agent
          (Cursor, Claude Code, etc.).
        </p>
        <pre className="code-block mt-4 overflow-x-auto text-ink-muted">
          {`# Skills CLI
npx skills add jeffIshmael/onfra-skill

# MCP manifest (tool discovery)
${API_URL}/.well-known/mcp.json`}
        </pre>
        <p className="mt-3 text-[11px] text-ink-faint">
          Skill source:{" "}
          <a
            href="https://github.com/jeffIshmael/onfra-skill"
            className="text-nude-muted hover:text-nude-soft"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/jeffIshmael/onfra-skill
          </a>{" "}
          — publish from the <code className="text-ink-muted">onfra-skill/</code> folder in the
          monorepo.
        </p>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {[
          { label: "MCP", title: "mcp.json", href: LINKS.mcp, desc: "Tool definitions, schemas, x402" },
          { label: "A2A", title: "agent-card.json", href: LINKS.agentCard, desc: "Capabilities and pricing" },
          {
            label: "ERC-8004",
            title: "8004scan · #9219",
            href: LINKS.agent8004,
            desc: "On-chain identity and reputation",
            wide: true
          }
        ].map((card) => (
          <a
            key={card.title}
            href={card.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`card-lift rounded-2xl p-5 ${card.wide ? "sm:col-span-2" : ""}`}
          >
            <p className="text-[10px] uppercase tracking-widest text-ink-faint">{card.label}</p>
            <p className="mt-2 text-sm font-medium">{card.title}</p>
            <p className="mt-1 text-[11px] text-ink-muted">{card.desc}</p>
          </a>
        ))}
      </div>

      <h2 className="mt-12 text-sm font-medium">MCP tools</h2>
      <div className="mt-4 space-y-2">
        {TOOLS.map((tool) => (
          <div
            key={tool.name}
            className="flex flex-col gap-1 rounded-xl border border-white/8 bg-canvas-card/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <code className="text-[11px] text-ink">{tool.name}</code>
            <span className="text-[10px] text-ink-faint">{tool.route}</span>
            <span className="text-[11px] text-ink-muted">{tool.desc}</span>
          </div>
        ))}
      </div>

      <pre className="code-block code-surface mt-8 overflow-x-auto rounded-2xl p-4 text-ink-muted">
        {`# MCP endpoint\n${API_URL}/.well-known/mcp.json`}
      </pre>

      <p className="mt-10 text-[11px] text-ink-muted">
        <Link href="/docs" className="font-medium text-nude-muted transition hover:text-nude-soft">
          Full documentation →
        </Link>
      </p>
    </PageShell>
  );
}
