"use client";

import { Bot } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { AGENT_CHAT_NAME } from "@/components/chat/chatContent";
import { AGENT_LOGO_PATH } from "@/lib/blockchain/constants";

export function AgentChatHeader({ compact = false }: { compact?: boolean }) {
  const [logoError, setLogoError] = useState(false);
  const avatarSize = compact ? 36 : 40;

  return (
    <div
      className={`flex items-center gap-3 pl-2 ${compact ? "py-2" : "border-b border-white/10 py-3 pl-2 pr-4"}`}
    >
      <div className="relative shrink-0">
        <div
          className="grid place-items-center overflow-hidden rounded-full border border-white/15 bg-black/70"
          style={{ width: avatarSize, height: avatarSize }}
        >
          {!logoError ? (
            <Image
              src={AGENT_LOGO_PATH}
              alt={`${AGENT_CHAT_NAME} logo`}
              width={avatarSize - 8}
              height={avatarSize - 8}
              className="object-contain"
              style={{ width: avatarSize - 10, height: avatarSize - 10 }}
              onError={() => setLogoError(true)}
            />
          ) : (
            <Bot size={compact ? 16 : 18} className="text-btc-orange" />
          )}
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-void bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
          aria-hidden
        />
      </div>

      <div className="min-w-0">
        <p className={`truncate font-sora font-bold text-white ${compact ? "text-sm" : "text-base"}`}>
          {AGENT_CHAT_NAME}
        </p>
      </div>
    </div>
  );
}
