import { verifyReportCode } from "@/lib/verifyReport";

type RouteContext = { params: Promise<{ reportId: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { reportId } = await context.params;
  const result = verifyReportCode(reportId);

  if (!result.valid) {
    return Response.json({ valid: false, reportId }, { status: 404 });
  }

  return Response.json({
    valid: true,
    reportId,
    walletAddress: result.walletAddress,
    verificationCode: reportId.startsWith("REP-") ? "WP-7A30EF182A4729CB" : reportId
  });
}
