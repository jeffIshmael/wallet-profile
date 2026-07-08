import Link from "next/link";
import { DocsBreadcrumb, DocsH2 } from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "request-schemas", title: "Request schemas" },
  { id: "response-schemas", title: "Response schemas" }
];

const SCHEMAS = [
  { file: "lenderScreenRequest.schema.json", kind: "Request" },
  { file: "lenderScreenResult.schema.json", kind: "Response" },
  { file: "walletAnalysisRequest.schema.json", kind: "Request" },
  { file: "walletAnalysisResult.schema.json", kind: "Response" },
  { file: "walletSignalResult.schema.json", kind: "Response" },
  { file: "chatRequest.schema.json", kind: "Request" },
  { file: "reportRequest.schema.json", kind: "Request" },
  { file: "reportResult.schema.json", kind: "Response" }
] as const;

export default function SchemasDocsPage() {
  return (
    <DocsShell toc={TOC}>
      <DocsBreadcrumb section="Agents" title="JSON schemas" />
      <h1 className="docs-title">JSON schemas</h1>
      <p className="docs-lead">
        Request and response shapes are defined in machine-readable JSON Schema at{" "}
        <code>{API_URL}/schemas/</code>. Use these for validation, codegen, and agent tool definitions.
      </p>

      <div className="docs-prose">
        <DocsH2 id="request-schemas">Request schemas</DocsH2>
        <ul>
          {SCHEMAS.filter((s) => s.kind === "Request").map((schema) => (
            <li key={schema.file}>
              <a
                href={`${API_URL}/schemas/${schema.file}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {schema.file}
              </a>
            </li>
          ))}
        </ul>

        <DocsH2 id="response-schemas">Response schemas</DocsH2>
        <ul>
          {SCHEMAS.filter((s) => s.kind === "Response").map((schema) => (
            <li key={schema.file}>
              <a
                href={`${API_URL}/schemas/${schema.file}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {schema.file}
              </a>
            </li>
          ))}
        </ul>

        <div className="docs-next-links">
          <Link href="/docs/rest-api" className="docs-next-card">
            <span className="docs-next-label">API</span>
            <span className="docs-next-title">REST API →</span>
          </Link>
          <Link href="/docs" className="docs-next-card">
            <span className="docs-next-label">Overview</span>
            <span className="docs-next-title">Getting started →</span>
          </Link>
        </div>
      </div>
    </DocsShell>
  );
}
