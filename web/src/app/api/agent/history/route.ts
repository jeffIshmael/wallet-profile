import { badRequest, isEvmAddress } from "@/lib/agent/validate";
import { getChatSessionsList } from "@/lib/db/chat";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const walletAddress = searchParams.get("walletAddress")?.trim();

  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress query param must be a valid 0x-prefixed EVM address.");
  }

  try {
    const history = await getChatSessionsList(walletAddress);
    return Response.json(history);
  } catch (error) {
    console.error("[history] Failed to load sessions list:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to load chat sessions." },
      { status: 500 }
    );
  }
}
