"use client";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChatStore } from "@/stores/chat-store";
import { ThemeToggle } from "@/components/ui";

export const ChatInterface = () => {
  const { messages, isStreaming, sendMessage } = useChatStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen">
      <div className="p-2 border-b flex justify-end">
        <ThemeToggle />
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((m, i) => (
          <ChatMessage key={i} message={m} />
        ))}
        {isStreaming && <ChatMessage message={{ role: "assistant", content: "" }} />}
        <div ref={bottomRef} />
      </div>
      <ChatInput onSend={sendMessage} />
    </div>
  );
};
