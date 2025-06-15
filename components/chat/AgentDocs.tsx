"use client";
import { useChatStore } from "@/stores/chat-store";

export const AgentDocs = () => {
  const docs = useChatStore((s) => s.docs);
  if (!docs.length) return null;
  return (
    <details className="text-xs text-gray-500 px-2">
      <summary>Context Documents ({docs.length})</summary>
      <ul className="list-disc list-inside space-y-1">
        {docs.map((d) => (
          <li key={d.id}>{d.text.slice(0, 60)}</li>
        ))}
      </ul>
    </details>
  );
};
