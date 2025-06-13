"use client";
import { Download } from "lucide-react";
import { Button } from "@/components/ui";
import { useChatStore } from "@/stores/chat-store";
import { exportConversation } from "@/lib/exportConversation";

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
        <Download className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={() => exportConversation(messages, "pdf")}
        aria-label="Export as PDF"
      >
        <Download className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        onClick={() => exportConversation(messages, "json")}
        aria-label="Export as JSON"
      >
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};
