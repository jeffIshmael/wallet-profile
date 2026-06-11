import { Info } from "lucide-react";
import { AGENT_CHAT_PRICING_NOTICE } from "@/components/chat/chatContent";

export function AgentChatPinnedNotice() {
  return (
    <div className="flex gap-2 rounded-xl border border-btc-orange/20 bg-btc-orange/5 px-3 py-2.5">
      <Info size={14} className="mt-0.5 shrink-0 text-btc-orange" />
      <p className="text-[11px] leading-5 text-stardust">{AGENT_CHAT_PRICING_NOTICE}</p>
    </div>
  );
}
