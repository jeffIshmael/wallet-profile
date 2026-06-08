"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TransactionStatementsPage } from "@/components/dashboard/TransactionStatementsView";

function StatementsPageContent() {
  const searchParams = useSearchParams();
  const initialChatOpen = searchParams.get("chat") === "1";
  const [chatOpen, setChatOpen] = useState(initialChatOpen);

  return <TransactionStatementsPage chatOpen={chatOpen} onChatOpenChange={setChatOpen} />;
}

export default function TransactionStatementsRoute() {
  return (
    <Suspense fallback={null}>
      <StatementsPageContent />
    </Suspense>
  );
}
