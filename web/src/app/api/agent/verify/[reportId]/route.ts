import { verifyReportCode } from "@/lib/verifyReport";

type RouteContext = { params: Promise<{ reportId: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const { reportId } = await context.params;
  const result = await verifyReportCode(reportId);

  if (!result.valid) {
    return Response.json({ valid: false, reportId }, { status: 404 });
  }

  return Response.json({
    valid: true,
    reportId: result.reportId,
    walletAddress: result.walletAddress,
    verificationCode: result.reportId,
    reputationScore: result.reputationScore,
    financialHealthScore: result.financialHealthScore,
    loanCapacity: result.loanCapacity,
    reportHash: result.reportHash,
    publishedAt: result.publishedAt,
    source: result.source
  });
}
