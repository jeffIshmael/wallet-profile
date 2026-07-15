import { useEffect, useState, useMemo } from "react";
import { parseChatMessage } from "@/lib/chat/formatChatMessage";
import { ReportCard } from "@/components/chat/ReportCard";

export function ChatMessageBody({ text, simulateStreaming = false }: { text: string; simulateStreaming?: boolean }) {
  const [displayedText, setDisplayedText] = useState(simulateStreaming ? "" : text);

  useEffect(() => {
    if (!simulateStreaming) {
      setDisplayedText(text);
      return;
    }

    let currentLength = 0;
    const interval = setInterval(() => {
      currentLength += Math.max(1, Math.floor(Math.random() * 5)); // Add 1-4 chars at a time
      if (currentLength >= text.length) {
        setDisplayedText(text);
        clearInterval(interval);
      } else {
        setDisplayedText(text.slice(0, currentLength));
      }
    }, 15); // Fast streaming

    return () => clearInterval(interval);
  }, [text, simulateStreaming]);

  const blocks = useMemo(() => parseChatMessage(displayedText), [displayedText]);

  // A basic parser to detect financial metrics and render a card instead of plain text
  const tryRenderCard = (textBlock: string) => {
    if (textBlock.includes("Financial health for") && textBlock.includes("/100")) {
      const scoreMatch = textBlock.match(/is (\d+\/100)/);
      if (scoreMatch) {
        return <ReportCard type="health" title="Financial Health" score={scoreMatch[1]} description={textBlock.split(". ")[1] || textBlock} />;
      }
    }
    if (textBlock.includes("Average monthly income for") && textBlock.includes("$")) {
      const match = textBlock.match(/is ~(.*?),/);
      if (match) {
        return <ReportCard type="income" title="Estimated Monthly Income" score={match[1]} description={textBlock} />;
      }
    }
    if (textBlock.includes("Safe borrowing range for")) {
      const match = textBlock.match(/is (.*?) \(/);
      if (match) {
        return <ReportCard type="capacity" title="Loan Capacity" score={match[1]} description={textBlock} />;
      }
    }
    if (textBlock.includes("Reputation for") && textBlock.includes("/100")) {
      const match = textBlock.match(/is (\d+\/100)/);
      if (match) {
        return <ReportCard type="reputation" title="Reputation Score" score={match[1]} description={textBlock.split(") ")[1] || textBlock} />;
      }
    }
    if (textBlock.includes("Portfolio risk for")) {
      const match = textBlock.match(/is "(.*?)"/);
      if (match) {
        return <ReportCard type="risk" title="Portfolio Risk" score={match[1]} description={textBlock.split(". ")[1] || textBlock} />;
      }
    }
    
    // Fallback normal text
    return (
      <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
        {textBlock}
      </p>
    );
  };

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return <div key={index}>{tryRenderCard(block.text)}</div>;
        }

        if (block.type === "bullets") {
          return (
            <ul key={index} className="list-disc space-y-1 pl-4">
              {block.items.map((item, i) => (
                <li key={i} className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <ol key={index} className="list-decimal space-y-1 pl-4">
            {block.items.map((item, i) => (
              <li key={i} className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                {item}
              </li>
            ))}
          </ol>
        );
      })}
    </div>
  );
}
