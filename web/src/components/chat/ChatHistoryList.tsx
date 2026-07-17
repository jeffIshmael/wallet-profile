"use client";

import { motion } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { formatMessageTime } from "@/lib/formatMessageTime";

type ChatSessionListProps = {
  address: string;
  onSelectSession: (id: string) => void;
};

type Session = {
  id: string;
  updatedAt: string;
  title: string;
};

function isToday(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

function isYesterday(dateString: string) {
  const date = new Date(dateString);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
}

export function ChatHistoryList({ address, onSelectSession }: ChatSessionListProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function loadSessions() {
      if (!address) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/agent/history?walletAddress=${encodeURIComponent(address)}`);
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (!cancelled) setSessions(data);
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadSessions();
    return () => { cancelled = true; };
  }, [address]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="animate-spin text-stardust" size={16} />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-stardust">
        No chat history found.
      </div>
    );
  }

  const today = sessions.filter(s => isToday(s.updatedAt));
  const yesterday = sessions.filter(s => isYesterday(s.updatedAt));
  const older = sessions.filter(s => !isToday(s.updatedAt) && !isYesterday(s.updatedAt));

  const renderGroup = (title: string, group: Session[]) => {
    if (group.length === 0) return null;
    return (
      <div className="mb-4">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stardust">{title}</h3>
        <div className="flex flex-col gap-2">
          {group.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => onSelectSession(session.id)}
                className="flex w-full flex-col gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.06]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-white line-clamp-1 flex-1 pr-2">
                    {session.title.length > 40 ? session.title.slice(0, 40) + "..." : session.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stardust mt-1">
                  <MessageSquare size={10} />
                  <span>{formatMessageTime(session.updatedAt)}</span>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col overflow-y-auto px-1 py-2">
      {renderGroup("Today", today)}
      {renderGroup("Yesterday", yesterday)}
      {renderGroup("Older", older)}
    </div>
  );
}
