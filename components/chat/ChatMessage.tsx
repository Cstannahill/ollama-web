"use client";
import type { ChatMessage as Message } from "@/types";
import { cn } from "@/lib/utils";
import { AdvancedMarkdown } from "../markdown";
import { ErrorBoundary } from "../ui";
import { useState } from "react";

// Custom Copy icon to avoid lucide-react issues
const Copy = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  return (
    <ErrorBoundary>
      <div
        className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "relative max-w-4xl w-full px-4 py-3 rounded-lg shadow-sm",
            isUser
              ? "bg-primary text-primary-foreground ml-8"
              : "bg-muted/50 text-foreground mr-8"
          )}
        >
          <button
            className="absolute top-2 right-2 opacity-50 hover:opacity-100 transition-opacity"
            onClick={() => {
              navigator.clipboard.writeText(message.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 1000);
            }}
            aria-label="Copy message"
          >
            <Copy className="w-4 h-4" />
          </button>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <AdvancedMarkdown content={message.content} />
          </div>
          {copied && (
            <span className="absolute bottom-2 right-2 text-xs opacity-75">
              Copied
            </span>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};
