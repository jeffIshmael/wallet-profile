"use client";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { HomeOverview } from "@/components/dashboard/HomeOverview";

type DashboardViewProps = {
  chatOpen?: boolean;
  onChatOpenChange?: (open: boolean) => void;
};

export function DashboardView({ chatOpen, onChatOpenChange }: DashboardViewProps) {
  return (
    <DashboardShell chatOpen={chatOpen} onChatOpenChange={onChatOpenChange} hideChatFab scrollable>
      <div className="mx-auto w-full max-w-5xl pb-6">
        <HomeOverview />
      </div>
    </DashboardShell>
  );
}