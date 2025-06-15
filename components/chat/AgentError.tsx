"use client";
import { useChatStore } from "@/stores/chat-store";

export const AgentError = () => {
  const error = useChatStore((s) => s.error);
  if (!error) return null;
  return <p className="text-xs text-red-500 px-2">Error: {error}</p>;
};
