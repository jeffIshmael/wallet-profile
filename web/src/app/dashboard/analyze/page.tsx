"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnalyzePage } from "@/components/layout/AnalyzePage";

function AnalyzePageContent() {
  const searchParams = useSearchParams();
  const [chatOpen, setChatOpen] = useState(searchParams.get("chat") === "1");

  return <AnalyzePage chatOpen={chatOpen} onChatOpenChange={setChatOpen} />;
}

export default function DashboardAnalyzePage() {
  return (
    <>
      {/* @ts-expect-error Suspense type incompatibility between React 18 and Next.js */}
      <Suspense fallback={null}>
        <AnalyzePageContent />
      </Suspense>
    </>
  );
}