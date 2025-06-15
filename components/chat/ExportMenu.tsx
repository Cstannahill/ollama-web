"use client";
import { Button } from "@/components/ui";
import { useChatStore } from "@/stores/chat-store";
import { exportConversation } from "@/lib/exportConversation";

// Custom Download icon
const Download = ({ className }: { className?: string }) => (
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
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

export const ExportMenu = () => {
  const { messages } = useChatStore();
  if (messages.length === 0) return null;
  return (
    <div className="flex gap-2">
      <Button
        size="icon"
        variant="outline"
        onClick={() => exportConversation(messages, "markdown")}
        aria-label="Export as Markdown"
      >
        <Download className="w-4 h-4" aria-hidden />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={() => exportConversation(messages, "pdf")}
        aria-label="Export as PDF"
      >
        <Download className="w-4 h-4" aria-hidden />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={() => exportConversation(messages, "json")}
        aria-label="Export as JSON"
      >
        <Download className="w-4 h-4" aria-hidden />
      </Button>
    </div>
  );
};
