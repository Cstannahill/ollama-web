"use client";
import { useChatStore } from "@/stores/chat-store";

export const AgentThinking = () => {
  const thinking = useChatStore((s) => s.thinking);
  if (!thinking) return null;
  return (
    <details className="text-xs text-gray-500 px-2">
      <summary>Thinking...</summary>
      <pre className="whitespace-pre-wrap">{thinking}</pre>
    </details>
  );
};
