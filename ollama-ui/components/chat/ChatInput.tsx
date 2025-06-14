"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chat-store";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [text, setText] = useState("");
  const isStreaming = useChatStore((s) => s.isStreaming);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText("");
      }}
      className="flex gap-2 p-2 border-t"
    >
      <textarea
        className="flex-1 rounded border p-2"
        value={text}
        onChange={(e) => setText(e.target.value)}
        aria-label="Message input"
        rows={1}
        disabled={disabled || isStreaming}
        disabled={disabled || isStreaming}
        aria-label="Message input"
        rows={1}
      />
      <Button type="submit" disabled={disabled || isStreaming}>
        {isStreaming ? "..." : "Send"}
      </Button>
      <span className="text-xs text-gray-500 self-end pb-1">{text.length}</span>
    </form>
  );
};
