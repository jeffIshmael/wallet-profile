import { parseChatMessage } from "@/lib/chat/formatChatMessage";

export function ChatMessageBody({ text }: { text: string }) {
  const blocks = parseChatMessage(text);

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        if (block.type === "paragraph") {
          return (
            <p key={index} className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {block.text}
            </p>
          );
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
