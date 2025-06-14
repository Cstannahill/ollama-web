"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chat-store";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export const ChatInput = ({ onSend }: ChatInputProps) => {
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
        rows={1}
        disabled={isStreaming}
      />
      <Button type="submit" disabled={isStreaming}>
        {isStreaming ? "..." : "Send"}
      </Button>
    </form>
  );
};
