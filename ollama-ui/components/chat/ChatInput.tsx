"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (text: string) => void;
}

export const ChatInput = ({ onSend }: ChatInputProps) => {
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
        rows={1}
      />
      <Button type="submit">Send</Button>
    </form>
  );
};
