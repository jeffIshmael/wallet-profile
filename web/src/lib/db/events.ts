import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { normalizeAddress } from "@/lib/db/constants";

type TrackEventInput = {
  endpoint: string;
  status: "success" | "error";
  walletAddress?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
};

async function insertEvent(input: TrackEventInput, walletAddress: string | undefined) {
  return prisma.apiEvent.create({
    data: {
      endpoint: input.endpoint,
      status: input.status,
      walletAddress,
      durationMs: input.durationMs,
      metadata: input.metadata as Prisma.InputJsonValue | undefined
    }
  });
}

/**
 * Best-effort usage logging. It NEVER throws, so a logging problem can never turn a
 * successful tool run (or a paid x402 request) into an error response.
 *
 * ApiEvent.walletAddress is a foreign key, so the insert fails for any wallet that is
 * not in the database (every external wallet analyzed by an agent). In that case we
 * retry once without the FK field and keep the address in metadata instead.
 * Returns the created row, or null if the event could not be stored.
 */
export async function trackApiEvent(input: TrackEventInput) {
  const walletAddress = input.walletAddress ? normalizeAddress(input.walletAddress) : undefined;

  try {
    return await insertEvent(input, walletAddress);
  } catch (error) {
    if (walletAddress) {
      try {
        return await insertEvent(
          { ...input, metadata: { ...input.metadata, wallet_address: walletAddress } },
          undefined
        );
      } catch (retryError) {
        console.error("[trackApiEvent] failed (ignored):", retryError);
        return null;
      }
    }
    console.error("[trackApiEvent] failed (ignored):", error);
    return null;
  }
}

export async function withApiTracking<T>(
  endpoint: string,
  walletAddress: string | undefined,
  fn: () => Promise<T>
): Promise<T> {
  const started = Date.now();
  try {
    const result = await fn();
    await trackApiEvent({
      endpoint,
      status: "success",
      walletAddress,
      durationMs: Date.now() - started
    });
    return result;
  } catch (error) {
    await trackApiEvent({
      endpoint,
      status: "error",
      walletAddress,
      durationMs: Date.now() - started,
      metadata: {
        message: error instanceof Error ? error.message : "Unknown error"
      }
    });
    throw error;
  }
}