"use client";
import { useChatStore } from "@/stores/chat-store";

export const AgentStatus = () => {
  const status = useChatStore((s) => s.status);
  if (!status) return null;
  return <p className="text-xs italic text-gray-500 px-2">{status}</p>;
};
