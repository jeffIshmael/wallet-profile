const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../web/src/components/chat/ChatSidebar.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

// 1. Imports
content = content.replace(
  'import { useEffect, useRef, useState } from "react";',
  'import { useEffect, useRef, useState } from "react";\nimport { motion, AnimatePresence } from "framer-motion";\nimport { MascotAnimator } from "@/components/chat/MascotAnimator";\nimport { ChatHistoryList } from "@/components/chat/ChatHistoryList";'
);

// 2. ChatMessage type
content = content.replace(
  'type ChatMessage = { role: "user" | "ai"; text: string; isError?: boolean; createdAt?: string };',
  'type ChatMessage = { role: "user" | "ai"; text: string; isError?: boolean; createdAt?: string; isNew?: boolean };'
);

// 3. activeTab state
content = content.replace(
  'const [loadingStatus, setLoadingStatus] = useState<string | null>(null);',
  'const [loadingStatus, setLoadingStatus] = useState<string | null>(null);\n  const [activeTab, setActiveTab] = useState<"chat" | "history">("chat");'
);

// 4. isNew on finishUserMessage
content = content.replace(
  'function finishUserMessage(reply: string, isError = false) {',
  'function finishUserMessage(reply: string, isError = false) {\n    // Mark all existing messages as not new\n    setMessages((current) => current.map(m => ({ ...m, isNew: false })));'
);
content = content.replace(
  '{ role: "ai", text: reply, isError, createdAt: messageTimestamp() }',
  '{ role: "ai", text: reply, isError, createdAt: messageTimestamp(), isNew: !isError }'
);

// 5. Tabs Layout & Content Split
content = content.replace(
  `        {!overlay && !fullPage && (
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-sora text-base font-bold text-white">Onfra AI</h2>
          </div>
        )}`,
  `        {!overlay && !fullPage && (
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-sora text-base font-bold text-white">Onfra AI</h2>
          </div>
        )}

        <div className="mb-4 flex gap-4 border-b border-white/10 pb-2 px-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={\`text-sm font-medium transition-colors \${activeTab === "chat" ? "text-white border-b-2 border-primary -mb-[9px] pb-2" : "text-stardust hover:text-white"}\`}
          >
            Agent Chat
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={\`text-sm font-medium transition-colors \${activeTab === "history" ? "text-white border-b-2 border-primary -mb-[9px] pb-2" : "text-stardust hover:text-white"}\`}
          >
            History
          </button>
        </div>

        {activeTab === "history" ? (
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ChatHistoryList />
          </div>
        ) : (
          <>`
);

// 6. Messages Render Loop
content = content.replace(
  `          {messages.length === 0 && !loadingHistory && (
            <p className="text-xs leading-5 text-stardust">
              Ask about your financial health, reputation, loan capacity, or portfolio risk.
            </p>
          )}

          {messages.map((message, index) => (
            <div
              key={\`\${message.role}-\${index}\`}
              className={\`flex max-w-[95%] flex-col gap-1 \${message.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}\`}
            >
              <button
                type="button"
                onClick={() => copyMessage(message.text)}
                title="Click to copy"
                className={
                  message.role === "user"
                    ? "rounded-lg bg-btc-orange px-3 py-2 text-left text-xs font-medium text-white break-words [overflow-wrap:anywhere] transition hover:bg-btc-orange/90"
                    : message.isError
                      ? "rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-left text-xs leading-5 text-danger break-words [overflow-wrap:anywhere]"
                      : "rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-left text-xs leading-5 text-stardust break-words [overflow-wrap:anywhere] transition hover:border-white/20"
                }
              >
                {message.role === "user" || message.isError ? (
                  message.text
                ) : (
                  <ChatMessageBody text={message.text} />
                )}
              </button>
              {message.createdAt && (
                <time
                  dateTime={message.createdAt}
                  className="px-1 text-[10px] text-stardust/60"
                >
                  {formatMessageTime(message.createdAt)}
                </time>
              )}
            </div>
          ))}

          {sending && loadingStatus && (
            <div className="mr-auto flex max-w-[95%] items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-stardust">
              <Loader2 size={12} className="animate-spin text-btc-orange" />
              <span>{loadingStatus}</span>
            </div>
          )}`,
  `          {messages.length === 0 && !loadingHistory && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center mt-4"
            >
              <MascotAnimator status="idle" size={80} />
              <h3 className="mt-6 font-sora text-lg font-bold text-white">Meet OnFRA Agent</h3>
              <p className="mt-2 text-xs leading-relaxed text-stardust max-w-[250px]">
                Analyze wallets, explain transactions, and estimate loan capacity securely.
              </p>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={\`\${message.role}-\${index}\`}
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={\`flex max-w-[90%] flex-col gap-1 \${message.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}\`}
            >
              <button
                type="button"
                onClick={() => copyMessage(message.text)}
                title="Click to copy"
                className={
                  message.role === "user"
                    ? "rounded-[18px] bg-primary/20 border border-primary/30 px-4 py-2.5 text-left text-[13px] font-medium text-white break-words [overflow-wrap:anywhere] shadow-sm backdrop-blur-md transition hover:bg-primary/30"
                    : message.isError
                      ? "rounded-[18px] border border-danger/30 bg-danger/10 px-4 py-2.5 text-left text-[13px] leading-relaxed text-danger break-words [overflow-wrap:anywhere]"
                      : "rounded-[18px] border border-white/10 bg-black/40 px-4 py-3 text-left text-[13px] leading-relaxed text-stardust break-words [overflow-wrap:anywhere] shadow-sm backdrop-blur-md transition hover:border-primary/40"
                }
              >
                {message.role === "user" || message.isError ? (
                  message.text
                ) : (
                  <ChatMessageBody text={message.text} simulateStreaming={message.isNew} />
                )}
              </button>
              {message.createdAt && (
                <time
                  dateTime={message.createdAt}
                  className="px-2 text-[10px] text-stardust/50 font-medium"
                >
                  {formatMessageTime(message.createdAt)}
                </time>
              )}
            </motion.div>
          ))}

          {sending && loadingStatus && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mr-auto flex max-w-[90%] items-center gap-3 rounded-[18px] border border-white/10 bg-black/40 px-4 py-3 text-sm text-primary shadow-sm backdrop-blur-md"
            >
              <MascotAnimator status="thinking" size={24} />
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-white text-xs">Analyzing</span>
                <span className="text-stardust text-[10px] flex items-center gap-1.5 font-medium">
                  <span className="animate-pulse text-primary">●</span> {loadingStatus}
                </span>
              </div>
            </motion.div>
          )}
          </AnimatePresence>`
);

// 7. Input Field enhancements
content = content.replace(
  `        <form
          className={\`mt-3 flex items-center gap-2 rounded-xl border p-2 \${
            fullPage
              ? "mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] border-white/20 bg-void-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              : "border-white/10 bg-black/30"
          }\`}`,
  `        <form
          className={\`mt-3 flex items-center gap-2 rounded-[24px] border p-1.5 \${
            fullPage
              ? "mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] border-white/20 bg-void-surface shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              : "border-white/10 bg-white/[0.02] shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] backdrop-blur-md"
          }\`}`
);

content = content.replace(
  `              className="grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-white/5 text-stardust transition hover:border-danger/40 hover:bg-danger/10 hover:text-danger"`,
  `              className="grid h-9 w-9 place-items-center rounded-full border border-white/15 bg-white/5 text-stardust transition hover:border-danger/40 hover:bg-danger/10 hover:text-danger"`
);

content = content.replace(
  `              className="grid h-8 w-8 place-items-center rounded-lg bg-btc-orange text-white transition hover:bg-btc-orange/90 disabled:opacity-50"`,
  `              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-void transition hover:bg-primary/90 disabled:opacity-50 shadow-[0_0_12px_rgba(184,176,200,0.3)] hover:shadow-[0_0_16px_rgba(184,176,200,0.5)] disabled:shadow-none"`
);

content = content.replace(
  `            className={\`min-w-0 flex-1 text-xs text-white outline-none placeholder:text-stardust \${
              fullPage
                ? "rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2"
                : "bg-transparent px-1"
            }\`}`,
  `            className={\`min-w-0 flex-1 text-[13px] text-white outline-none placeholder:text-stardust/60 px-3 \${
              fullPage
                ? "rounded-full border border-white/10 bg-white/[0.06] py-2.5"
                : "bg-transparent py-2"
            }\`}`
);

// Close the Fragment tag introduced in step 5
content = content.replace(
  `        {overlay && onClose && (
          <button type="button" onClick={onClose} className="sr-only">
            Close chat
          </button>
        )}
      </div>`,
  `          </>
        )}
        
        {overlay && onClose && (
          <button type="button" onClick={onClose} className="sr-only">
            Close chat
          </button>
        )}
      </div>`
);

// Make suggestion chips look premium (radius, primary border)
content = content.replace(
  `                className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-stardust transition hover:border-btc-orange/40 hover:text-white disabled:opacity-50"`,
  `                className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-stardust shadow-sm transition hover:border-primary/40 hover:text-primary hover:bg-primary/10 disabled:opacity-50"`
);

fs.writeFileSync(filePath, content);
console.log("ChatSidebar updated successfully!");
