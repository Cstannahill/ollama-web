import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Clock,
  Database,
  Brain,
  Zap,
  Activity,
  BarChart3,
  Timer,
} from "lucide-react";

interface MetricData {
  queryRewriteTime?: number;
  embeddingTime?: number;
  retrievalTime?: number;
  rerankingTime?: number;
  contextTime?: number;
  responseTime?: number;
  totalTime?: number;
  docsRetrieved: number;
  tokensEstimated: number;
  efficiency?: number;
  tokensPerSecond?: number;
  toolsUsed?: number;
  toolExecutionTime?: number;
}

interface ProcessingMetricsProps {
  metrics: MetricData;
  compact?: boolean;
}

export const ProcessingMetrics = ({
  metrics,
  compact = false,
}: ProcessingMetricsProps) => {
  const formatTime = (ms?: number) => {
    if (!ms) return "—";
    return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
  };

  const getEfficiencyColor = (efficiency?: number) => {
    if (!efficiency) return "text-muted-foreground";
    if (efficiency < 100) return "text-green-600";
    if (efficiency < 300) return "text-yellow-600";
    return "text-red-600";
  };

  const getEfficiencyLabel = (efficiency?: number) => {
    if (!efficiency) return "Unknown";
    if (efficiency < 100) return "Excellent";
    if (efficiency < 300) return "Good";
    return "Needs Optimization";
  };

  const timeMetrics = [
    {
      label: "Query Rewriting",
      time: metrics.queryRewriteTime,
      icon: Brain,
      color: "text-purple-600",
    },
    {
      label: "Embedding",
      time: metrics.embeddingTime,
      icon: Zap,
      color: "text-blue-600",
    },
    {
      label: "Retrieval",
      time: metrics.retrievalTime,
      icon: Database,
      color: "text-green-600",
    },
    {
      label: "Reranking",
      time: metrics.rerankingTime,
      icon: TrendingUp,
      color: "text-orange-600",
    },
    {
      label: "Context Building",
      time: metrics.contextTime,
      icon: BarChart3,
      color: "text-indigo-600",
    },
    {
      label: "Response",
      time: metrics.responseTime,
      icon: Activity,
      color: "text-red-600",
    },
  ].filter((metric) => metric.time !== undefined);

  if (compact) {
    return (
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/30 border-slate-200 dark:border-slate-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {formatTime(metrics.totalTime)}
                </div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {metrics.docsRetrieved}
                </div>
                <div className="text-xs text-muted-foreground">Documents</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-foreground">
                  {metrics.tokensEstimated}
                </div>
                <div className="text-xs text-muted-foreground">Tokens</div>
              </div>
            </div>

            {metrics.efficiency && (
              <Badge
                variant="outline"
                className={`${getEfficiencyColor(metrics.efficiency)} border-current`}
              >
                {getEfficiencyLabel(metrics.efficiency)}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950/30 dark:to-indigo-950/30">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="w-5 h-5 text-blue-600" />
          Processing Metrics
          <Badge variant="secondary" className="ml-auto">
            {formatTime(metrics.totalTime)} total
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Time Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Processing Stages
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {timeMetrics.map((metric, index) => {
              const Icon = metric.icon;
              const percentage = metrics.totalTime
                ? ((metric.time || 0) / metrics.totalTime) * 100
                : 0;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/50"
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${metric.color}`} />
                    <span className="text-sm text-foreground">
                      {metric.label}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">
                      {formatTime(metric.time)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance Stats
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/50">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.docsRetrieved}
              </div>
              <div className="text-xs text-muted-foreground">
                Documents Retrieved
              </div>
            </div>

            <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/50">
              <div className="text-2xl font-bold text-green-600">
                {metrics.tokensEstimated}
              </div>
              <div className="text-xs text-muted-foreground">
                Tokens Estimated
              </div>
            </div>

            {metrics.tokensPerSecond && (
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/50">
                <div className="text-2xl font-bold text-purple-600">
                  {metrics.tokensPerSecond.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Tokens/Second
                </div>
              </div>
            )}

            {metrics.toolsUsed !== undefined && (
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/50">
                <div className="text-2xl font-bold text-orange-600">
                  {metrics.toolsUsed}
                </div>
                <div className="text-xs text-muted-foreground">Tools Used</div>
              </div>
            )}
          </div>
        </div>

        {/* Efficiency Indicator */}
        {metrics.efficiency && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Efficiency Rating
            </h4>

            <div className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">
                  Time per Document
                </span>
                <span
                  className={`text-sm font-medium ${getEfficiencyColor(metrics.efficiency)}`}
                >
                  {getEfficiencyLabel(metrics.efficiency)}
                </span>
              </div>
              <Progress
                value={Math.min(100, Math.max(0, 100 - metrics.efficiency / 5))}
                className="h-2"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.efficiency.toFixed(1)}ms per document
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
