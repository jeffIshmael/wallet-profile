import { getIntegrationsSummary } from "@/lib/agent/integrations";

/**
 * Always HTTP 200 so agents can read settlement address / discovery even when
 * optional deps (e.g. OpenAI probe) are degraded. Use `agentReady` / `ok`.
 */
export async function GET() {
  const summary = await getIntegrationsSummary();

  return Response.json(summary, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": "*"
    }
  });
}
