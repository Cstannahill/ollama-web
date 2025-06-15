"use client";
import { useChatStore } from "@/stores/chat-store";

// Custom Loader icon
const Loader = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

export const AgentStatus = () => {
  const status = useChatStore((s) => s.status);
  const streaming = useChatStore((s) => s.isStreaming);

  if (!status) return null;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/50 rounded-lg mx-4 mb-2"
      aria-live="polite"
    >
      {streaming && <Loader className="w-3 h-3 animate-spin" />}
      <span className="italic">{status}</span>
    </div>
  );
};
