import { getIntegrationsSummary } from "@/lib/agent/integrations";

export async function GET() {
  const summary = await getIntegrationsSummary();
  const ok = summary.gemini.ok && summary.thirdweb.ok;

  return Response.json(summary, { status: ok ? 200 : 503 });
}
