"use client";
import { useChatStore } from "@/stores/chat-store";

export const AgentSummary = () => {
  const summary = useChatStore((s) => s.summary);
  if (!summary) return null;
  return <p className="text-xs text-gray-600 px-2">Summary: {summary}</p>;
};
