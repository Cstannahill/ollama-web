"use client";

import { useState, useEffect } from "react";
import { PipelineMetrics } from "@/services/agent-pipeline";

interface TimelineStep {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: "pending" | "running" | "completed" | "failed";
  color: string;
  icon: string;
}

interface PipelineTimelineProps {
  metrics: PipelineMetrics;
  currentStep?: string;
  className?: string;
}

export function PipelineTimeline({
  metrics,
  currentStep,
  className = "",
}: PipelineTimelineProps) {
  const [steps, setSteps] = useState<TimelineStep[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timelineSteps: TimelineStep[] = [
      {
        name: "Query Rewriting",
        startTime: metrics.startTime,
        endTime: metrics.queryRewriteTime
          ? metrics.startTime + metrics.queryRewriteTime
          : undefined,
        duration: metrics.queryRewriteTime,
        status: metrics.queryRewriteTime
          ? "completed"
          : currentStep === "query-rewrite"
            ? "running"
            : "pending",
        color: "bg-blue-500",
        icon: "✏️",
      },
      {
        name: "Embedding",
        startTime: metrics.startTime + (metrics.queryRewriteTime || 0),
        endTime: metrics.embeddingTime
          ? metrics.startTime +
            (metrics.queryRewriteTime || 0) +
            metrics.embeddingTime
          : undefined,
        duration: metrics.embeddingTime,
        status: metrics.embeddingTime
          ? "completed"
          : currentStep === "embedding"
            ? "running"
            : "pending",
        color: "bg-green-500",
        icon: "🔢",
      },
      {
        name: "Document Retrieval",
        startTime:
          metrics.startTime +
          (metrics.queryRewriteTime || 0) +
          (metrics.embeddingTime || 0),
        endTime: metrics.retrievalTime
          ? metrics.startTime +
            (metrics.queryRewriteTime || 0) +
            (metrics.embeddingTime || 0) +
            metrics.retrievalTime
          : undefined,
        duration: metrics.retrievalTime,
        status: metrics.retrievalTime
          ? "completed"
          : currentStep === "retrieval"
            ? "running"
            : "pending",
        color: "bg-yellow-500",
        icon: "📚",
      },
      {
        name: "Reranking",
        startTime:
          metrics.startTime +
          (metrics.queryRewriteTime || 0) +
          (metrics.embeddingTime || 0) +
          (metrics.retrievalTime || 0),
        endTime: metrics.rerankingTime
          ? metrics.startTime +
            (metrics.queryRewriteTime || 0) +
            (metrics.embeddingTime || 0) +
            (metrics.retrievalTime || 0) +
            metrics.rerankingTime
          : undefined,
        duration: metrics.rerankingTime,
        status: metrics.rerankingTime
          ? "completed"
          : currentStep === "reranking"
            ? "running"
            : "pending",
        color: "bg-orange-500",
        icon: "🔄",
      },
      {
        name: "Context Building",
        startTime:
          metrics.startTime +
          (metrics.queryRewriteTime || 0) +
          (metrics.embeddingTime || 0) +
          (metrics.retrievalTime || 0) +
          (metrics.rerankingTime || 0),
        endTime: metrics.contextTime
          ? metrics.startTime +
            (metrics.queryRewriteTime || 0) +
            (metrics.embeddingTime || 0) +
            (metrics.retrievalTime || 0) +
            (metrics.rerankingTime || 0) +
            metrics.contextTime
          : undefined,
        duration: metrics.contextTime,
        status: metrics.contextTime
          ? "completed"
          : currentStep === "context"
            ? "running"
            : "pending",
        color: "bg-purple-500",
        icon: "🧩",
      },
      {
        name: "Response Generation",
        startTime:
          metrics.startTime +
          (metrics.queryRewriteTime || 0) +
          (metrics.embeddingTime || 0) +
          (metrics.retrievalTime || 0) +
          (metrics.rerankingTime || 0) +
          (metrics.contextTime || 0),
        endTime: metrics.responseTime
          ? metrics.startTime +
            (metrics.queryRewriteTime || 0) +
            (metrics.embeddingTime || 0) +
            (metrics.retrievalTime || 0) +
            (metrics.rerankingTime || 0) +
            (metrics.contextTime || 0) +
            metrics.responseTime
          : undefined,
        duration: metrics.responseTime,
        status: metrics.responseTime
          ? "completed"
          : currentStep === "generation"
            ? "running"
            : "pending",
        color: "bg-red-500",
        icon: "🤖",
      },
    ];

    // Add tool execution if it happened
    if (metrics.toolExecutionTime) {
      timelineSteps.push({
        name: "Tool Execution",
        startTime:
          metrics.startTime +
          (metrics.queryRewriteTime || 0) +
          (metrics.embeddingTime || 0) +
          (metrics.retrievalTime || 0),
        endTime:
          metrics.startTime +
          (metrics.queryRewriteTime || 0) +
          (metrics.embeddingTime || 0) +
          (metrics.retrievalTime || 0) +
          metrics.toolExecutionTime,
        duration: metrics.toolExecutionTime,
        status: "completed",
        color: "bg-indigo-500",
        icon: "🔧",
      });
    }

    setSteps(
      timelineSteps.filter(
        (step) => step.duration !== undefined || step.status === "running"
      )
    );
    setIsAnimating(currentStep !== undefined);
  }, [metrics, currentStep]);

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-400 animate-none";
      case "running":
        return "bg-blue-400 animate-pulse";
      case "failed":
        return "bg-red-400 animate-none";
      default:
        return "bg-gray-300 animate-none";
    }
  };

  const totalDuration = metrics.totalTime || 0;
  const maxWidth = Math.max(totalDuration, 1000); // Minimum width for better visualization

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border p-4 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Pipeline Timeline
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Total: {formatTime(totalDuration)}
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const widthPercent = step.duration
            ? (step.duration / maxWidth) * 100
            : 5;
          const leftPercent = step.startTime
            ? ((step.startTime - metrics.startTime) / maxWidth) * 100
            : 0;

          return (
            <div key={step.name} className="relative">
              {/* Step name and info */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusDot(step.status)}`}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {step.icon} {step.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {step.duration ? formatTime(step.duration) : "..."}
                </span>
              </div>

              {/* Timeline bar container */}
              <div className="relative bg-gray-200 dark:bg-gray-700 rounded-full h-2 ml-4">
                {/* Timeline bar */}
                <div
                  className={`absolute top-0 h-2 rounded-full transition-all duration-500 ${step.color} ${
                    step.status === "running" ? "animate-pulse" : ""
                  }`}
                  style={{
                    left: `${leftPercent}%`,
                    width: `${widthPercent}%`,
                    opacity: step.status === "pending" ? 0.3 : 1,
                  }}
                />

                {/* Running indicator */}
                {step.status === "running" && (
                  <div
                    className="absolute top-0 h-2 w-4 bg-blue-300 rounded-full animate-pulse"
                    style={{
                      left: `${leftPercent + widthPercent - 2}%`,
                    }}
                  />
                )}
              </div>

              {/* Performance warnings */}
              {metrics.performanceWarnings?.some((w) =>
                w.stepName.toLowerCase().includes(step.name.toLowerCase())
              ) && (
                <div className="ml-4 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    ⚠️ Slow
                  </span>
                </div>
              )}

              {/* Error indicator */}
              {metrics.errors?.some((e) =>
                e.step.toLowerCase().includes(step.name.toLowerCase())
              ) && (
                <div className="ml-4 mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                    ❌ Error
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline scale */}
      <div className="mt-4 ml-4">
        <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500">
          <span>0ms</span>
          <span>{formatTime(maxWidth / 4)}</span>
          <span>{formatTime(maxWidth / 2)}</span>
          <span>{formatTime((3 * maxWidth) / 4)}</span>
          <span>{formatTime(maxWidth)}</span>
        </div>
        <div className="w-full h-px bg-gray-300 dark:bg-gray-600 mt-1" />
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">Steps</div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {steps.filter((s) => s.status === "completed").length}/
            {steps.length}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Docs Retrieved
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {metrics.docsRetrieved}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded p-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Cache Hits
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {metrics.cacheHits || 0}/{metrics.cacheAttempts || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
