"use client";
import type { ChatMessage as Message } from "@/types";
import { cn } from "@/lib/utils";
import { AdvancedMarkdown } from "../markdown";
import { ErrorBoundary } from "../ui";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const bubble = isUser ? "bg-ollama-green text-white" : "bg-white text-black";
  const align = isUser ? "self-end" : "self-start";

  return (
    <ErrorBoundary>
      <div className={cn("prose max-w-sm p-3 rounded-md", bubble, align)}>
        <AdvancedMarkdown content={message.content} />
      </div>
    </ErrorBoundary>
  );
};
