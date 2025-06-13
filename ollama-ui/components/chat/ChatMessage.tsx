"use client";
import type { ChatMessage as Message } from "@/types";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const bubble = isUser ? "bg-ollama-green text-white" : "bg-white text-black";
  const align = isUser ? "self-end" : "self-start";

  return (
    <div className={cn("max-w-sm p-3 rounded-md", bubble, align)}>
      {message.content}
    </div>
  );
};
