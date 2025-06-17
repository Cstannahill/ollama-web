"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface Metric {
  id: string;
  label: string;
  value: number | string;
  format?: "number" | "percentage" | "currency" | "time" | "custom";
  suffix?: string;
  prefix?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
    period?: string;
  };
  target?: number;
  color?: "default" | "success" | "warning" | "error" | "info";
  description?: string;
}

interface MetricsDashboardProps {
  metrics: Metric[];
  title?: string;
  layout?: "grid" | "list" | "compact";
  columns?: number;
  className?: string;
  showTrends?: boolean;
  showTargets?: boolean;
}

const TrendIcon = ({ direction }: { direction: "up" | "down" | "neutral" }) => {
  if (direction === "up") {
    return (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
        />
      </svg>
    );
  }

  if (direction === "down") {
    return (
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
        />
      </svg>
    );
  }

  return (
    <svg
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 12H4"
      />
    </svg>
  );
};

const formatValue = (
  value: number | string,
  format?: string,
  prefix?: string,
  suffix?: string
) => {
  let formatted = String(value);

  if (typeof value === "number") {
    switch (format) {
      case "percentage":
        formatted = `${value.toFixed(1)}%`;
        break;
      case "currency":
        formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
        break;
      case "number":
        formatted = new Intl.NumberFormat("en-US").format(value);
        break;
      case "time":
        if (value < 60) {
          formatted = `${value.toFixed(1)}s`;
        } else if (value < 3600) {
          formatted = `${(value / 60).toFixed(1)}m`;
        } else {
          formatted = `${(value / 3600).toFixed(1)}h`;
        }
        break;
      default:
        formatted = value.toLocaleString();
    }
  }

  return `${prefix || ""}${formatted}${suffix || ""}`;
};

const getColorClasses = (color?: string) => {
  switch (color) {
    case "success":
      return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800";
    case "warning":
      return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-800";
    case "error":
      return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800";
    case "info":
      return "text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800";
    default:
      return "text-foreground bg-card border-border";
  }
};

const getTrendColorClasses = (direction: "up" | "down" | "neutral") => {
  switch (direction) {
    case "up":
      return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
    case "down":
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
    default:
      return "text-muted-foreground bg-muted";
  }
};

const ProgressBar = ({
  value,
  target,
  color,
}: {
  value: number;
  target: number;
  color?: string;
}) => {
  const percentage = Math.min((value / target) * 100, 100);

  return (
    <div className="w-full bg-muted rounded-full h-2 mt-2">
      <div
        className={cn(
          "h-2 rounded-full transition-all duration-300",
          color === "success" && "bg-green-500",
          color === "warning" && "bg-yellow-500",
          color === "error" && "bg-red-500",
          color === "info" && "bg-blue-500",
          !color && "bg-primary"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

const MetricCard = ({
  metric,
  showTrends,
  showTargets,
}: {
  metric: Metric;
  showTrends: boolean;
  showTargets: boolean;
}) => (
  <div className={cn("p-4 rounded-lg border", getColorClasses(metric.color))}>
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">
          {metric.label}
        </p>
        <p className="text-2xl font-bold mt-1">
          {formatValue(
            metric.value,
            metric.format,
            metric.prefix,
            metric.suffix
          )}
        </p>

        {metric.description && (
          <p className="text-xs text-muted-foreground mt-1">
            {metric.description}
          </p>
        )}
      </div>

      {showTrends && metric.trend && (
        <div
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            getTrendColorClasses(metric.trend.direction)
          )}
        >
          <TrendIcon direction={metric.trend.direction} />
          {Math.abs(metric.trend.value)}%
          {metric.trend.period && (
            <span className="ml-1 opacity-75">{metric.trend.period}</span>
          )}
        </div>
      )}
    </div>

    {showTargets && metric.target && typeof metric.value === "number" && (
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
          <span>
            Target:{" "}
            {formatValue(
              metric.target,
              metric.format,
              metric.prefix,
              metric.suffix
            )}
          </span>
          <span>{Math.round((metric.value / metric.target) * 100)}%</span>
        </div>
        <ProgressBar
          value={metric.value}
          target={metric.target}
          color={metric.color}
        />
      </div>
    )}
  </div>
);

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({
  metrics,
  title,
  layout = "grid",
  columns = 3,
  className,
  showTrends = true,
  showTargets = true,
}) => {
  if (layout === "list") {
    return (
      <div className={cn("w-full space-y-4", className)}>
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        <div className="space-y-2">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-card"
            >
              <div>
                <p className="font-medium">{metric.label}</p>
                {metric.description && (
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {formatValue(
                    metric.value,
                    metric.format,
                    metric.prefix,
                    metric.suffix
                  )}
                </p>
                {showTrends && metric.trend && (
                  <div
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      metric.trend.direction === "up" && "text-green-600",
                      metric.trend.direction === "down" && "text-red-600",
                      metric.trend.direction === "neutral" &&
                        "text-muted-foreground"
                    )}
                  >
                    <TrendIcon direction={metric.trend.direction} />
                    {Math.abs(metric.trend.value)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className={cn("w-full", className)}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex flex-wrap gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="flex items-center gap-3 px-3 py-2 border rounded-lg bg-card min-w-[150px]"
            >
              <div>
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="font-bold">
                  {formatValue(
                    metric.value,
                    metric.format,
                    metric.prefix,
                    metric.suffix
                  )}
                </p>
              </div>
              {showTrends && metric.trend && (
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    getTrendColorClasses(metric.trend.direction)
                  )}
                >
                  <TrendIcon direction={metric.trend.direction} />
                  {Math.abs(metric.trend.value)}%
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Grid layout (default)
  return (
    <div className={cn("w-full", className)}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(columns, metrics.length)}, 1fr)`,
        }}
      >
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            showTrends={showTrends}
            showTargets={showTargets}
          />
        ))}
      </div>
    </div>
  );
};

export default MetricsDashboard;
