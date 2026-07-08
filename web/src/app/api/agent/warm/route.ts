import { badRequest, isEvmAddress, parseJsonBody } from "@/lib/agent/validate";

async function loadWarmModule() {
  try {
    return await import("@/lib/agent/onfra-dist/warm_cache.js");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `OnFRA warm cache module not found (${message}). Run \`npm run build:agent\` from the web folder.`
    );
  }
}

/** Prefetch onchain data so the first full analyze is faster when it hits the same runtime. */
export async function POST(req: Request) {
  const body = parseJsonBody<{ walletAddress?: string; months?: number }>(
    await req.json().catch(() => null)
  );
  if (!body) return badRequest("Invalid JSON body.");

  const walletAddress = body.walletAddress?.trim();
  if (!walletAddress || !isEvmAddress(walletAddress)) {
    return badRequest("walletAddress must be a valid 0x-prefixed EVM address.");
  }

  const started = Date.now();
  const logPrefix = `[warm ${walletAddress.slice(0, 10)}…]`;

  try {
    const { warmWalletDataCache } = await loadWarmModule();
    await warmWalletDataCache(walletAddress.toLowerCase(), body.months ?? 12);
    console.log(`${logPrefix} Warmed in ${Date.now() - started}ms`);
    return Response.json({ status: "warmed", walletAddress: walletAddress.toLowerCase() });
  } catch (error) {
    console.warn(`${logPrefix} Warm failed after ${Date.now() - started}ms:`, error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Warm prefetch failed." },
      { status: 500 }
    );
  }
}
