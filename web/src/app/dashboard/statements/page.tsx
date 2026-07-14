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
    <>
      {/* @ts-expect-error Suspense type incompatibility between React 18 and Next.js */}
      <Suspense fallback={null}>
        <StatementsPageContent />
      </Suspense>
    </>
  );
}
