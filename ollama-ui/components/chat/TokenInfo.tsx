"use client";
import { useChatStore } from "@/stores/chat-store";

export const TokenInfo = () => {
  const tokens = useChatStore((s) => s.tokens);
  if (tokens == null) return null;
  return <p className="text-xs text-gray-500 px-2">Tokens: {tokens}</p>;
};
