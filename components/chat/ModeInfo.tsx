"use client";

import { useChatStore } from "@/stores/chat-store";
import { useSettingsStore } from "@/stores/settings-store";
import { Card, CardContent } from "@/components/ui/card";

// Custom info icon
const InfoIcon = ({ className }: { className?: string }) => (
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
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// Custom warning icon
const WarningIcon = ({ className }: { className?: string }) => (
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
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

export const ModeInfo = () => {
  const { mode, messages } = useChatStore();
  const { vectorStorePath } = useSettingsStore();

  // Don't show if there are messages
  if (messages.length > 0) return null;

  const modeInfo = {
    simple: {
      title: "Simple Chat Mode",
      description: "Direct conversation with your AI model",
      features: [
        "Fast, immediate responses",
        "Uses your selected model directly",
        "No document retrieval",
        "Best for general questions and conversations",
      ],
      icon: "💬",
    },
    agentic: {
      title: "Agentic Chat Mode",
      description: "AI agent with advanced reasoning and document search",
      features: [
        "Searches through your knowledge base",
        "Embedding-based document retrieval",
        "Intelligent reranking of results",
        "Context-aware responses with sources",
        "Multi-step reasoning process",
      ],
      icon: "🧠",
    },
  };

  const currentMode = modeInfo[mode];
  const showVectorWarning = mode === "agentic" && !vectorStorePath;

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8 text-center">
          <div className="text-4xl mb-4">{currentMode.icon}</div>
          <h2 className="text-2xl font-bold mb-2">{currentMode.title}</h2>
          <p className="text-muted-foreground mb-6">
            {currentMode.description}
          </p>

          <div className="grid gap-3 mb-6 text-left">
            {currentMode.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>

          {showVectorWarning && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-2">
                <WarningIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Vector Store Not Configured
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    To use Agentic mode, you need to configure a vector store
                    path in settings. This will enable document search and
                    retrieval capabilities.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <InfoIcon className="w-4 h-4" />
            Start typing to begin your conversation
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
