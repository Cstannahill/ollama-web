"use client";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Error type detection and categorization
function categorizeError(error: string): {
  type: "timeout" | "network" | "config" | "processing" | "unknown";
  severity: "high" | "medium" | "low";
  canRetry: boolean;
  remediation: string;
} {
  const errorLower = error.toLowerCase();
  if (errorLower.includes("timed out")) {
    return {
      type: "timeout",
      severity: "medium",
      canRetry: true,
      remediation:
        "The operation took too long. Try again or adjust timeout settings in the Advanced Options.",
    };
  }

  if (
    errorLower.includes("network") ||
    errorLower.includes("connection") ||
    errorLower.includes("fetch")
  ) {
    return {
      type: "network",
      severity: "high",
      canRetry: true,
      remediation: "Check your internet connection and try again.",
    };
  }

  if (
    errorLower.includes("config") ||
    errorLower.includes("setup") ||
    errorLower.includes("missing")
  ) {
    return {
      type: "config",
      severity: "high",
      canRetry: false,
      remediation:
        "Check your settings and ensure all required fields are configured.",
    };
  }

  if (errorLower.includes("processing") || errorLower.includes("failed to")) {
    return {
      type: "processing",
      severity: "medium",
      canRetry: true,
      remediation:
        "There was an issue processing your request. Try again with a simpler query.",
    };
  }

  return {
    type: "unknown",
    severity: "medium",
    canRetry: true,
    remediation: "An unexpected error occurred. Please try again.",
  };
}

// Error type icons
const ErrorIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "timeout":
      return <span className="text-orange-500">⏱️</span>;
    case "network":
      return <span className="text-red-500">🌐</span>;
    case "config":
      return <span className="text-yellow-500">⚙️</span>;
    case "processing":
      return <span className="text-blue-500">⚡</span>;
    default:
      return <span className="text-gray-500">❌</span>;
  }
};

export const AgentError = () => {
  const { error, sendMessage, messages, consecutiveFailures, mode, setMode } =
    useChatStore();

  if (!error) return null;

  const errorInfo = categorizeError(error);

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter((m) => m.role === "user").pop();
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content);
      }
    }
  };

  const handleSwitchToSimple = () => {
    setMode("simple");
    handleRetry();
  };

  const isHighFailureCount = consecutiveFailures >= 2;
  const showSimpleModeOption = mode === "agentic" && isHighFailureCount;

  return (
    <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <ErrorIcon type={errorInfo.type} />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">
              Error
            </span>
            <Badge
              variant="secondary"
              className={`text-xs ${
                errorInfo.severity === "high"
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : errorInfo.severity === "medium"
                    ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              }`}
            >
              {errorInfo.type}
            </Badge>
          </div>{" "}
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          {consecutiveFailures > 0 && (
            <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
              ⚠️ {consecutiveFailures} consecutive failure
              {consecutiveFailures > 1 ? "s" : ""} detected
              {consecutiveFailures >= 3 && " (auto-switching to simple mode)"}
            </div>
          )}
          <p className="text-xs text-red-500 dark:text-red-400">
            💡 {errorInfo.remediation}
          </p>
          {errorInfo.canRetry && (
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="text-xs h-7"
              >
                🔄 Retry
              </Button>

              {showSimpleModeOption && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwitchToSimple}
                  className="text-xs h-7 text-blue-600 hover:text-blue-700"
                >
                  🚀 Try Simple Mode
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
