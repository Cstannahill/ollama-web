"use client";

import { useChatStore } from "@/stores/chat-store";
import { cn } from "@/lib/utils";

// Custom icons for modes
const SimpleIcon = ({ className }: { className?: string }) => (
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
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

const AgenticIcon = ({ className }: { className?: string }) => (
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
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);

export const ModeSelector = () => {
  const { mode, setMode, isStreaming } = useChatStore();

  const modes = [
    {
      id: "simple" as const,
      label: "Simple",
      description: "Direct chat with AI model",
      icon: SimpleIcon,
    },
    {
      id: "agentic" as const,
      label: "Agentic",
      description: "AI with document search & reasoning",
      icon: AgenticIcon,
    },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {modes.map((modeOption) => {
        const Icon = modeOption.icon;
        const isActive = mode === modeOption.id;

        return (
          <button
            key={modeOption.id}
            onClick={() => !isStreaming && setMode(modeOption.id)}
            disabled={isStreaming}
            className={cn(
              "relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
              "hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
            title={modeOption.description}
          >
            <Icon className="w-4 h-4" />
            <span>{modeOption.label}</span>
            {isActive && (
              <div className="absolute inset-0 rounded-md ring-2 ring-primary/20" />
            )}
          </button>
        );
      })}
    </div>
  );
};
