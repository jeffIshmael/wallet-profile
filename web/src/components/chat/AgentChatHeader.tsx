"use client";

import { Bot } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AGENT_CHAT_NAME } from "@/components/chat/chatContent";
import { AGENT_LOGO_PATH } from "@/lib/blockchain/constants";

export function AgentChatHeader({ compact = false }: { compact?: boolean }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${compact ? "" : "border-b border-white/10 px-4 py-3"}`}>
      <div
        className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full border border-btc-orange/30 bg-btc-orange/10 ${
          compact ? "h-9 w-9" : "h-10 w-10"
        }`}
      >
        {!logoError ? (
          <Image
            src={AGENT_LOGO_PATH}
            alt={`${AGENT_CHAT_NAME} logo`}
            width={compact ? 36 : 40}
            height={compact ? 36 : 40}
            className="h-full w-full object-cover"
            onError={() => setLogoError(true)}
          />
        ) : (
          <Bot size={compact ? 18 : 20} className="text-btc-orange" />
        )}
      </div>

      <div className="min-w-0">
        <p className={`truncate font-sora font-bold text-white ${compact ? "text-sm" : "text-base"}`}>
          {AGENT_CHAT_NAME}
        </p>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="text-[11px] text-stardust">Online</span>
        </div>
      </div>
    </div>
  );
}
