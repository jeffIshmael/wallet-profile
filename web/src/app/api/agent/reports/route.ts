import { badRequest, isEvmAddress } from "@/lib/agent/validate";
import { listReportsForAddress } from "@/lib/db/reports";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address")?.trim();

  if (!address || !isEvmAddress(address)) {
    return badRequest("address must be a valid 0x-prefixed EVM address.");
  }

  try {
    const reports = await listReportsForAddress(address);
    return Response.json({ address: address.toLowerCase(), reports });
  } catch (error) {
    console.error("[reports] Failed to list reports:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to list reports." },
      { status: 500 }
    );
  }
}
