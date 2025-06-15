"use client";
import { useChatStore } from "@/stores/chat-store";

export const AgentToolOutput = () => {
  const tools = useChatStore((s) => s.tools);
  if (!tools.length) return null;
  return (
    <details className="text-xs text-gray-500 px-2">
      <summary>Tool Output</summary>
      <ul className="list-disc list-inside space-y-1">
        {tools.map((t, i) => (
          <li key={i}>
            <strong>{t.name}:</strong> {t.output}
          </li>
        ))}
      </ul>
    </details>
  );
};
