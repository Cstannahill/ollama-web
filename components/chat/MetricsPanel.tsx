"use client";

import { useState } from "react";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { PipelineMetrics } from "@/services/agent-pipeline";

// Metrics icon
const MetricsIcon = ({ className }: { className?: string }) => (
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
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 00-2-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

interface MetricsData extends PipelineMetrics {
  efficiency: number;
  tokensPerSecond: number;
}

interface MetricItemProps {
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  color?: "green" | "blue" | "orange" | "purple";
}

const MetricItem = ({
  label,
  value,
  unit,
  description,
  color = "blue",
}: MetricItemProps) => {
  const colorClasses = {
    green: "text-green-600 dark:text-green-400",
    blue: "text-blue-600 dark:text-blue-400",
    orange: "text-orange-600 dark:text-orange-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground" title={description}>
        {label}
      </span>
      <div className="flex items-center gap-1">
        <span className={`text-sm font-mono ${colorClasses[color]}`}>
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </div>
  );
};

export const MetricsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { mode } = useChatStore();

  // Get the latest metrics from chat store with proper typing
  const metrics = useChatStore((state) => state.metrics) as MetricsData | null;

  // Only show for agentic mode and when we have metrics
  if (mode !== "agentic" || !metrics) return null;

  const formatTime = (ms?: number) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatEfficiency = (efficiency: number) => {
    if (efficiency === 0) return "N/A";
    return `${efficiency.toFixed(1)}ms/doc`;
  };

  const formatToolsUsed = (count?: number) => {
    if (!count || count === 0) return "None";
    return `${count} tool${count > 1 ? "s" : ""}`;
  };

  const getPerformanceColor = (
    time?: number
  ): "green" | "orange" | "purple" => {
    if (!time) return "purple";
    if (time < 1000) return "green";
    if (time < 5000) return "orange";
    return "purple";
  };

  return (
    <div className="bg-muted/30 border rounded-lg mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center gap-2">
              <MetricsIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Pipeline Metrics</span>
              {metrics.totalTime && (
                <Badge variant="secondary" className="text-xs">
                  {formatTime(metrics.totalTime)}
                </Badge>
              )}
            </div>
            <span
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {/* Performance Overview */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Performance Overview
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <MetricItem
                  label="Total Time"
                  value={formatTime(metrics.totalTime)}
                  color={getPerformanceColor(metrics.totalTime)}
                  description="Total pipeline execution time"
                />
                <MetricItem
                  label="Documents"
                  value={metrics.docsRetrieved}
                  color="blue"
                  description="Number of documents retrieved"
                />
                <MetricItem
                  label="Tokens"
                  value={metrics.tokensEstimated}
                  color="purple"
                  description="Estimated tokens in final prompt"
                />
                <MetricItem
                  label="Speed"
                  value={
                    metrics.tokensPerSecond > 0
                      ? metrics.tokensPerSecond.toFixed(1)
                      : "N/A"
                  }
                  unit="tok/s"
                  color="green"
                  description="Tokens generated per second"
                />
              </div>
            </div>

            {/* Step Breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Step Breakdown
              </h4>
              <div className="space-y-1">
                {metrics.queryRewriteTime && (
                  <MetricItem
                    label="Query Rewrite"
                    value={formatTime(metrics.queryRewriteTime)}
                    color={getPerformanceColor(metrics.queryRewriteTime)}
                  />
                )}
                {metrics.embeddingTime && (
                  <MetricItem
                    label="Embedding"
                    value={formatTime(metrics.embeddingTime)}
                    color={getPerformanceColor(metrics.embeddingTime)}
                  />
                )}
                {metrics.retrievalTime && (
                  <MetricItem
                    label="Retrieval"
                    value={formatTime(metrics.retrievalTime)}
                    color={getPerformanceColor(metrics.retrievalTime)}
                  />
                )}
                {metrics.rerankingTime && (
                  <MetricItem
                    label="Reranking"
                    value={formatTime(metrics.rerankingTime)}
                    color={getPerformanceColor(metrics.rerankingTime)}
                  />
                )}
                {metrics.contextTime && (
                  <MetricItem
                    label="Context Building"
                    value={formatTime(metrics.contextTime)}
                    color={getPerformanceColor(metrics.contextTime)}
                  />
                )}
                {metrics.responseTime && (
                  <MetricItem
                    label="Response Generation"
                    value={formatTime(metrics.responseTime)}
                    color={getPerformanceColor(metrics.responseTime)}
                  />
                )}
              </div>
            </div>

            {/* Efficiency Metrics */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Efficiency
              </h4>
              <MetricItem
                label="Time per Document"
                value={formatEfficiency(metrics.efficiency)}
                color="orange"
                description="Average processing time per retrieved document"
              />
              <MetricItem
                label="Tools Used"
                value={formatToolsUsed(metrics.toolsUsed)}
                color="green"
                description="Number of tools used in the pipeline"
              />

              {/* Performance Warnings and Errors */}
              {(metrics.performanceWarnings?.length ||
                metrics.errors?.length) && (
                <div className="space-y-2 mt-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Issues
                  </h4>

                  {metrics.performanceWarnings?.map((warning, idx) => (
                    <div
                      key={`warning-${idx}`}
                      className="flex items-center justify-between text-xs p-2 rounded bg-yellow-50 dark:bg-yellow-900/20"
                    >
                      <span className="text-yellow-700 dark:text-yellow-300">
                        ⚠️ {warning.stepName} slow
                      </span>
                      <span className="text-yellow-600 dark:text-yellow-400 font-mono">
                        {formatTime(warning.actualMs)}
                      </span>
                    </div>
                  ))}

                  {metrics.errors?.map((error, idx) => (
                    <div
                      key={`error-${idx}`}
                      className={`text-xs p-2 rounded ${
                        error.isRecoverable
                          ? "bg-orange-50 dark:bg-orange-900/20"
                          : "bg-red-50 dark:bg-red-900/20"
                      }`}
                    >
                      <div
                        className={`font-medium ${
                          error.isRecoverable
                            ? "text-orange-700 dark:text-orange-300"
                            : "text-red-700 dark:text-red-300"
                        }`}
                      >
                        {error.isRecoverable ? "🔄" : "❌"} {error.step}
                      </div>
                      <div
                        className={`truncate ${
                          error.isRecoverable
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {error.error}
                      </div>
                      {error.isRecoverable && (
                        <div className="text-green-600 dark:text-green-400 text-xs mt-1">
                          ✓ Recovered automatically
                        </div>
                      )}
                    </div>
                  ))}

                  {!metrics.performanceWarnings?.length &&
                    !metrics.errors?.length && (
                      <div className="text-xs p-2 rounded bg-green-50 dark:bg-green-900/20">
                        <span className="text-green-700 dark:text-green-300">
                          ✅ No performance issues
                        </span>
                      </div>
                    )}
                </div>
              )}

              {/* Cache Performance */}
              {(metrics.cacheAttempts || 0) > 0 && (
                <div className="space-y-2 mt-3">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Cache Performance
                  </h4>
                  <MetricItem
                    label="Cache Hit Rate"
                    value={`${Math.round(((metrics.cacheHits || 0) / (metrics.cacheAttempts || 1)) * 100)}%`}
                    color={
                      (metrics.cacheHits || 0) / (metrics.cacheAttempts || 1) >
                      0.7
                        ? "green"
                        : "orange"
                    }
                    description="Percentage of cached results used"
                  />
                  <MetricItem
                    label="Cache Hits"
                    value={`${metrics.cacheHits || 0}/${metrics.cacheAttempts || 0}`}
                    color="blue"
                    description="Number of cache hits vs attempts"
                  />
                </div>
              )}

              {/* Visual progress bar for relative step times */}
              {metrics.totalTime && (
                <div className="space-y-2 mt-3">
                  <span className="text-xs text-muted-foreground">
                    Step Time Distribution
                  </span>
                  <div className="space-y-1">
                    {[
                      { name: "Retrieval", time: metrics.retrievalTime },
                      { name: "Generation", time: metrics.responseTime },
                      { name: "Context", time: metrics.contextTime },
                      { name: "Embedding", time: metrics.embeddingTime },
                      { name: "Reranking", time: metrics.rerankingTime },
                    ]
                      .filter((step) => step.time)
                      .sort((a, b) => (b.time || 0) - (a.time || 0))
                      .slice(0, 3)
                      .map((step) => (
                        <div
                          key={step.name}
                          className="flex items-center gap-2"
                        >
                          <span className="text-xs w-16 text-muted-foreground">
                            {step.name}
                          </span>
                          <Progress
                            value={
                              ((step.time || 0) / (metrics.totalTime || 1)) *
                              100
                            }
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-12">
                            {Math.round(
                              ((step.time || 0) / (metrics.totalTime || 1)) *
                                100
                            )}
                            %
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
