"use client";

import { useChatStore } from "@/stores/chat-store";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Custom process icon
const ProcessIcon = ({ className }: { className?: string }) => (
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

export const AgenticProcessIndicator = () => {
  const { mode, status, isStreaming, docs, tokens } = useChatStore();

  // Only show for agentic mode when processing
  if (mode !== "agentic" || !status || !isStreaming) return null;

  const processSteps = [
    {
      key: "Rewriting query for better results",
      label: "Rewriting",
      description: "Optimizing query for better results",
    },
    {
      key: "Embedding",
      label: "Embedding",
      description: "Converting your question to vector representation",
    },
    {
      key: "Embedding query",
      label: "Embedding",
      description: "Converting your question to vector representation",
    },
    {
      key: "Retrieving documents",
      label: "Retrieving",
      description: "Searching knowledge base for relevant documents",
    },
    {
      key: "Retrieving relevant documents",
      label: "Retrieving",
      description: "Searching knowledge base for relevant documents",
    },
    {
      key: "Retrieving relevant documents (multi-turn)",
      label: "Multi-Turn Retrieval",
      description: "Analyzing conversation history for enhanced context",
    },
    {
      key: "Reranking results",
      label: "Reranking",
      description: "Intelligently ranking results by relevance",
    },
    {
      key: "Reranking results for relevance",
      label: "Reranking",
      description: "Intelligently ranking results by relevance",
    },
    {
      key: "Building context from documents",
      label: "Context",
      description: "Processing retrieved information",
    },
    {
      key: "Searching for current information online",
      label: "Web Search",
      description: "Finding current information online",
    },
    {
      key: "Finding relevant web resources",
      label: "Web Search",
      description: "Searching for helpful web resources",
    },
    {
      key: "Augmenting knowledge with web search",
      label: "Web Search",
      description: "Enhancing context with web search",
    },
    {
      key: "Summarizing context",
      label: "Summarizing",
      description: "Processing retrieved information",
    },
    {
      key: "Assembling final prompt",
      label: "Assembling",
      description: "Constructing enhanced prompt with context",
    },
    {
      key: "Building prompt",
      label: "Building",
      description: "Constructing enhanced prompt with context",
    },
    {
      key: "Generating response",
      label: "Generating",
      description: "AI model generating response",
    },
    {
      key: "Invoking model",
      label: "Generating",
      description: "AI model generating response",
    },
    {
      key: "Completed",
      label: "Complete",
      description: "Response ready",
    },
  ];

  const currentStepIndex = processSteps.findIndex(
    (step) => step.key === status
  );
  const currentStep = processSteps[currentStepIndex];

  // Fallback for unknown status messages
  const displayStep = currentStep || {
    label: "Processing",
    description: status || "Working on your request...",
  };
  const progress =
    currentStepIndex >= 0
      ? ((currentStepIndex + 1) / processSteps.length) * 100
      : 0;

  return (
    <div className="bg-muted/50 border rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <ProcessIcon className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Agentic Processing</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {Math.round(progress)}%
        </Badge>
      </div>

      <div className="space-y-3">
        <Progress value={progress} className="h-2" />

        {displayStep && (
          <div className="text-sm">
            <div className="font-medium text-foreground mb-1">
              {displayStep.label}
            </div>
            <div className="text-muted-foreground text-xs">
              {displayStep.description}
            </div>
          </div>
        )}

        {/* Show additional context if available */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          {docs.length > 0 && (
            <div className="flex items-center gap-1">
              <span>📄</span>
              <span>{docs.length} documents found</span>
            </div>
          )}
          {tokens && (
            <div className="flex items-center gap-1">
              <span>🔤</span>
              <span>{tokens.toLocaleString()} tokens</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
