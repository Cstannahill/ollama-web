import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain,
  Lightbulb,
  Target,
  Clock,
  AlertCircle,
  Sparkles,
} from "lucide-react";

interface InsightCardProps {
  title: string;
  content: string;
  confidence?: number;
  category?: "analysis" | "recommendation" | "insight" | "warning";
  metadata?: {
    processingTime?: number;
    sources?: string[];
    complexity?: "low" | "medium" | "high";
  };
}

export const InsightCard = ({
  title,
  content,
  confidence = 85,
  category = "insight",
  metadata,
}: InsightCardProps) => {
  const getIcon = () => {
    switch (category) {
      case "analysis":
        return <Brain className="w-5 h-5" />;
      case "recommendation":
        return <Lightbulb className="w-5 h-5" />;
      case "insight":
        return <Sparkles className="w-5 h-5" />;
      case "warning":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (category) {
      case "analysis":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-blue-200 dark:border-blue-800",
          icon: "text-blue-600 dark:text-blue-400",
          badge:
            "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        };
      case "recommendation":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30",
          border: "border-amber-200 dark:border-amber-800",
          icon: "text-amber-600 dark:text-amber-400",
          badge:
            "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
        };
      case "insight":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/30",
          border: "border-purple-200 dark:border-purple-800",
          icon: "text-purple-600 dark:text-purple-400",
          badge:
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
        };
      case "warning":
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          border: "border-red-200 dark:border-red-800",
          icon: "text-red-600 dark:text-red-400",
          badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        };
    }
  };

  const colors = getColors();

  return (
    <Card
      className={`${colors.bg} ${colors.border} transition-all duration-300 hover:shadow-lg`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className={colors.icon}>{getIcon()}</span>
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={colors.badge}>
              {category}
            </Badge>
            {confidence && (
              <Badge variant="secondary" className="text-xs">
                {confidence}% confident
              </Badge>
            )}
          </div>
        </div>
        {confidence && (
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Confidence</span>
              <span>{confidence}%</span>
            </div>
            <Progress value={confidence} className="h-1.5" />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed text-foreground/90">{content}</p>

        {metadata && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {metadata.processingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {metadata.processingTime}ms
                </div>
              )}
              {metadata.sources && (
                <div className="flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  {metadata.sources.length} sources
                </div>
              )}
              {metadata.complexity && (
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    metadata.complexity === "high"
                      ? "border-red-300 text-red-700"
                      : metadata.complexity === "medium"
                        ? "border-amber-300 text-amber-700"
                        : "border-green-300 text-green-700"
                  }`}
                >
                  {metadata.complexity} complexity
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
