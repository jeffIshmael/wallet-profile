"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardView } from "@/components/dashboard/DashboardView";

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const initialChatOpen = searchParams.get("chat") === "1";
  const [chatOpen, setChatOpen] = useState(initialChatOpen);

  return <DashboardView chatOpen={chatOpen} onChatOpenChange={setChatOpen} />;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardPageContent />
    </Suspense>
  );
}
