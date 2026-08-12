import { getIntegrationsSummary } from "@/lib/agent/integrations";

export async function GET() {
  const summary = await getIntegrationsSummary();
  const ok = summary.openai.ok && summary.x402Status.ok;

  return Response.json(summary, { status: 200 });
}
