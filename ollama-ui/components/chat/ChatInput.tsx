"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [text, setText] = useState("");

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
        disabled={disabled}
        rows={1}
      />
      <span className="text-xs text-gray-500 self-end pb-1">
        {text.length}
      </span>
      <Button type="submit" disabled={disabled}>
        Send
      </Button>
    </form>
  );
};
