import { prisma } from "@/lib/db/prisma";
import { normalizeAddress } from "@/lib/db/constants";
import { upsertWallet } from "@/lib/db/wallets";

export async function getOrCreateChatSession(walletAddress: string, sessionId?: string) {
  const address = normalizeAddress(walletAddress);
  await upsertWallet(address);

  if (sessionId && sessionId !== "new") {
    const existing = await prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        messages: { orderBy: { createdAt: "asc" } }
      }
    });
    if (existing && existing.walletAddress === address) return existing;
  }

  if (sessionId !== "new") {
    const existing = await prisma.chatSession.findFirst({
      where: { walletAddress: address },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: { orderBy: { createdAt: "asc" } }
      }
    });

    if (existing) return existing;
  }

  return prisma.chatSession.create({
    data: { walletAddress: address },
    include: { messages: true }
  });
}

export async function appendChatMessages(
  sessionId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
) {
  if (messages.length === 0) return;

  await prisma.$transaction([
    ...messages.map((message) =>
      prisma.chatMessage.create({
        data: {
          sessionId,
          role: message.role,
          content: message.content
        }
      })
    ),
    prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    })
  ]);
}

export async function getChatHistory(walletAddress: string, sessionId?: string) {
  const session = await getOrCreateChatSession(walletAddress, sessionId);
  return {
    sessionId: session.id,
    messages: session.messages.map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
      createdAt: message.createdAt.toISOString()
    }))
  };
}

export async function getChatSessionsList(walletAddress: string) {
  const address = normalizeAddress(walletAddress);
  
  const sessions = await prisma.chatSession.findMany({
    where: { walletAddress: address },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        where: { role: "user" },
        orderBy: { createdAt: "asc" },
        take: 1
      }
    }
  });

  return sessions.map((session) => ({
    id: session.id,
    updatedAt: session.updatedAt.toISOString(),
    title: session.messages[0]?.content ?? "New Chat"
  }));
}
