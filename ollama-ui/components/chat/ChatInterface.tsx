"use client";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChatStore } from "@/stores/chat-store";
import { ThemeToggle, Badge, Button, Spinner, Progress, Toast } from "@/components/ui";
import { ExportMenu } from "./ExportMenu";
import { AgentStatus } from "./AgentStatus";

export const ChatInterface = () => {
  const { messages, isStreaming, sendMessage, stop, mode, status, error, setError } =
    useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);
  const statusOrder = [
    "Embedding query",
    "Retrieving documents",
    "Reranking results",
    "Summarizing context",
    "Building prompt",
    "Invoking model",
    "Completed",
  ];
  const idx = statusOrder.indexOf(status ?? "");
  const progress = idx >= 0 ? ((idx + 1) / statusOrder.length) * 100 : 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-2 border-b flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ExportMenu />
          <Badge>{mode} mode</Badge>
        </div>
        <div className="flex items-center gap-2">
          {status && (
            <span
              className={`text-xs italic flex items-center gap-1 ${status.toLowerCase().includes('failed') ? 'text-red-500' : status === 'Completed' ? 'text-green-600' : 'text-gray-500'}`}
            >
              {isStreaming && <Spinner className="w-3 h-3" />}
              {status}
            </span>
          )}
          {isStreaming && (
            <Button variant="outline" size="icon" onClick={stop}>
              Stop
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
      {isStreaming && <Progress value={progress} />}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((m, i) => (
          <ChatMessage key={i} message={m} />
        ))}
        {isStreaming && <ChatMessage message={{ role: "assistant", content: "" }} />}
        <AgentStatus />
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={sendMessage} disabled={isStreaming} />
      {error && <Toast message={error} onDismiss={() => setError(null)} />}
    </div>
  );
};
