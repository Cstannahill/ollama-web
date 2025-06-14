"use client";
import { useChatStore } from "@/stores/chat-store";
import { Loader2 } from "lucide-react";

export const AgentStatus = () => {
  const status = useChatStore((s) => s.status);
  const streaming = useChatStore((s) => s.isStreaming);
  if (!status) return null;
  return (
    <p className="text-xs italic text-gray-500 px-2 flex items-center gap-1">
      {streaming && <Loader2 className="w-3 h-3 animate-spin" />} {status}
    </p>
  );
};
