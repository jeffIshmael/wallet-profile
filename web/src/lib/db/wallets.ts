import { prisma } from "@/lib/db/prisma";
import { normalizeAddress } from "@/lib/db/constants";

export async function upsertWallet(address: string, ens?: string | null) {
  const normalized = normalizeAddress(address);
  return prisma.wallet.upsert({
    where: { address: normalized },
    create: { address: normalized, ens: ens ?? null },
    update: ens ? { ens } : {}
  });
}

export async function getWallet(address: string) {
  return prisma.wallet.findUnique({
    where: { address: normalizeAddress(address) }
  });
}
