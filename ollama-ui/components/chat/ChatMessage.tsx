"use client";
import type { ChatMessage as Message } from "@/types";
import { cn } from "@/lib/utils";
import { AdvancedMarkdown } from "../markdown";
import { ErrorBoundary } from "../ui";
import { Copy } from "lucide-react";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const bubble = isUser ? "bg-ollama-green text-white" : "bg-white text-black";
  const align = isUser ? "self-end" : "self-start";
  const [copied, setCopied] = useState(false);

  return (
    <ErrorBoundary>
      <div className={cn("relative prose max-w-sm p-3 rounded-md", bubble, align)}>
        <button
          className="absolute top-1 right-1 opacity-50 hover:opacity-100"
          onClick={() => {
            navigator.clipboard.writeText(message.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1000);
          }}
          aria-label="Copy message"
        >
          <Copy className="w-3 h-3" />
        </button>
        <AdvancedMarkdown content={message.content} />
        {copied && (
          <span className="absolute bottom-1 right-1 text-[10px] text-gray-500">Copied</span>
        )}
      </div>
    </ErrorBoundary>
  );
};
