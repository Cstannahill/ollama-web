"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  timestamp?: string;
  status?: "completed" | "current" | "pending" | "error";
  icon?: React.ReactNode;
  details?: string[];
  metadata?: Record<string, any>;
}

interface TimelineProps {
  steps: TimelineStep[];
  title?: string;
  orientation?: "vertical" | "horizontal";
  className?: string;
  showConnectors?: boolean;
  interactive?: boolean;
}

const CheckIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const ExclamationIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const getStatusIcon = (status: TimelineStep["status"]) => {
  switch (status) {
    case "completed":
      return <CheckIcon />;
    case "current":
      return <ClockIcon />;
    case "error":
      return <ExclamationIcon />;
    default:
      return <div className="w-3 h-3 rounded-full bg-current"></div>;
  }
};

const getStatusColor = (status: TimelineStep["status"]) => {
  switch (status) {
    case "completed":
      return "text-green-600 bg-green-100 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800";
    case "current":
      return "text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800";
    case "error":
      return "text-red-600 bg-red-100 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800";
    default:
      return "text-muted-foreground bg-muted border-border";
  }
};

export const Timeline: React.FC<TimelineProps> = ({
  steps,
  title,
  orientation = "vertical",
  className,
  showConnectors = true,
  interactive = false,
}) => {
  const [expandedSteps, setExpandedSteps] = React.useState<Set<string>>(
    new Set()
  );

  const toggleExpanded = (stepId: string) => {
    if (!interactive) return;

    setExpandedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  if (orientation === "horizontal") {
    return (
      <div className={cn("w-full", className)}>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center gap-4 flex-shrink-0"
            >
              <div className="flex flex-col items-center min-w-[120px]">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2",
                    getStatusColor(step.status),
                    interactive &&
                      "cursor-pointer hover:scale-105 transition-transform"
                  )}
                  onClick={() => toggleExpanded(step.id)}
                >
                  {step.icon || getStatusIcon(step.status)}
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm">{step.title}</div>
                  {step.timestamp && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {step.timestamp}
                    </div>
                  )}
                </div>
              </div>
              {showConnectors && index < steps.length - 1 && (
                <div className="h-px bg-border flex-1 min-w-[40px]"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {title && <h3 className="text-lg font-semibold mb-6">{title}</h3>}
      <div className="relative">
        {/* Vertical connector line */}
        {showConnectors && (
          <div className="absolute left-5 top-5 bottom-5 w-px bg-border"></div>
        )}

        <div className="space-y-6">
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.has(step.id);
            const hasDetails = step.details && step.details.length > 0;

            return (
              <div key={step.id} className="relative flex gap-4">
                {/* Timeline icon */}
                <div
                  className={cn(
                    "relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    getStatusColor(step.status),
                    interactive &&
                      "cursor-pointer hover:scale-105 transition-transform"
                  )}
                  onClick={() => toggleExpanded(step.id)}
                >
                  {step.icon || getStatusIcon(step.status)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {step.title}
                      </h4>
                      {step.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      )}
                    </div>
                    {step.timestamp && (
                      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                        {step.timestamp}
                      </div>
                    )}
                  </div>

                  {/* Expandable details */}
                  {hasDetails && (
                    <div className="mt-3">
                      <button
                        onClick={() => toggleExpanded(step.id)}
                        className="text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        {isExpanded ? "Hide details" : "Show details"}
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                          {step.details!.map((detail, detailIndex) => (
                            <div
                              key={detailIndex}
                              className="text-sm text-muted-foreground pl-4 border-l-2 border-muted"
                            >
                              {detail}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  {step.metadata && Object.keys(step.metadata).length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(step.metadata).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between p-2 bg-muted/50 rounded"
                        >
                          <span className="text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, " $1").trim()}:
                          </span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
