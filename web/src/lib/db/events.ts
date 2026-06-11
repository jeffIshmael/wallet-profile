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

export async function trackApiEvent(input: TrackEventInput) {
  const walletAddress = input.walletAddress ? normalizeAddress(input.walletAddress) : undefined;

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
