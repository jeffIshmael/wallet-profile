"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AgentChatPage } from "@/components/chat/AgentChatPage";
import { useWalletAuth } from "@/hooks/useWalletAuth";

export default function ChatPage() {
  const router = useRouter();
  const { ready, authenticated } = useWalletAuth();

  useEffect(() => {
    if (ready && !authenticated) {
      router.replace("/");
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return null;
  }

  return <AgentChatPage />;
}
