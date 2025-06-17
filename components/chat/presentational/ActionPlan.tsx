import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Target,
  Zap,
  TrendingUp,
} from "lucide-react";

interface ActionStep {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "immediate" | "short-term" | "long-term";
  estimatedTime?: string;
  difficulty?: "easy" | "medium" | "hard";
  prerequisites?: string[];
}

interface ActionPlanProps {
  title: string;
  objective: string;
  steps: ActionStep[];
  context?: string;
  confidence?: number;
}

export const ActionPlan = ({
  title,
  objective,
  steps,
  context,
  confidence = 85,
}: ActionPlanProps) => {
  const getPriorityIcon = (priority: ActionStep["priority"]) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "medium":
        return <Info className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getPriorityColors = (priority: ActionStep["priority"]) => {
    switch (priority) {
      case "high":
        return {
          bg: "bg-red-50 dark:bg-red-950/30",
          border: "border-red-200 dark:border-red-800",
          badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        };
      case "medium":
        return {
          bg: "bg-yellow-50 dark:bg-yellow-950/30",
          border: "border-yellow-200 dark:border-yellow-800",
          badge:
            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        };
      case "low":
        return {
          bg: "bg-green-50 dark:bg-green-950/30",
          border: "border-green-200 dark:border-green-800",
          badge:
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        };
    }
  };

  const getCategoryIcon = (category: ActionStep["category"]) => {
    switch (category) {
      case "immediate":
        return <Zap className="w-3 h-3" />;
      case "short-term":
        return <Target className="w-3 h-3" />;
      case "long-term":
        return <TrendingUp className="w-3 h-3" />;
    }
  };

  const groupedSteps = {
    immediate: steps.filter((step) => step.category === "immediate"),
    "short-term": steps.filter((step) => step.category === "short-term"),
    "long-term": steps.filter((step) => step.category === "long-term"),
  };

  return (
    <Card className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950/30 dark:via-purple-950/30 dark:to-pink-950/30 border-indigo-200 dark:border-indigo-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lightbulb className="w-5 h-5 text-indigo-600" />
            {title}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-100"
            >
              Action Plan
            </Badge>
            <Badge variant="secondary">{confidence}% confidence</Badge>
          </div>
        </div>

        {/* Objective */}
        <div className="mt-4 p-4 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20">
          <h3 className="text-sm font-medium text-foreground mb-2">
            Objective
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {objective}
          </p>

          {context && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <h4 className="text-xs font-medium text-foreground mb-1">
                Context
              </h4>
              <p className="text-xs text-muted-foreground">{context}</p>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20">
            <div className="text-lg font-bold text-indigo-600">
              {steps.length}
            </div>
            <div className="text-xs text-muted-foreground">Total Steps</div>
          </div>
          <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20">
            <div className="text-lg font-bold text-purple-600">
              {steps.filter((s) => s.priority === "high").length}
            </div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-white/20">
            <div className="text-lg font-bold text-pink-600">
              {groupedSteps.immediate.length}
            </div>
            <div className="text-xs text-muted-foreground">Immediate</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {Object.entries(groupedSteps).map(([category, categorySteps]) => {
          if (categorySteps.length === 0) return null;

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                {getCategoryIcon(category as ActionStep["category"])}
                <h3 className="text-sm font-medium text-foreground capitalize">
                  {category.replace("-", " ")} Actions
                </h3>
                <Badge variant="outline" className="text-xs">
                  {categorySteps.length} step
                  {categorySteps.length !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="space-y-3">
                {categorySteps.map((step, index) => {
                  const colors = getPriorityColors(step.priority);

                  return (
                    <div
                      key={step.id}
                      className={`p-4 ${colors.bg} ${colors.border} border-l-4 rounded-lg transition-all duration-200 hover:shadow-md`}
                    >
                      {/* Step Header */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-6 h-6 bg-white dark:bg-slate-800 rounded-full text-xs font-medium text-foreground">
                            {index + 1}
                          </div>
                          <h4 className="font-medium text-sm text-foreground">
                            {step.title}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          {getPriorityIcon(step.priority)}
                          <Badge className={colors.badge} variant="outline">
                            {step.priority}
                          </Badge>
                        </div>
                      </div>

                      {/* Step Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3 ml-8">
                        {step.description}
                      </p>

                      {/* Step Metadata */}
                      <div className="ml-8 space-y-2">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {step.estimatedTime && (
                            <div className="flex items-center gap-1">
                              <span>⏱️ {step.estimatedTime}</span>
                            </div>
                          )}

                          {step.difficulty && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                step.difficulty === "hard"
                                  ? "border-red-300 text-red-700"
                                  : step.difficulty === "medium"
                                    ? "border-yellow-300 text-yellow-700"
                                    : "border-green-300 text-green-700"
                              }`}
                            >
                              {step.difficulty} difficulty
                            </Badge>
                          )}
                        </div>

                        {step.prerequisites &&
                          step.prerequisites.length > 0 && (
                            <div className="text-xs">
                              <span className="text-muted-foreground">
                                Prerequisites:{" "}
                              </span>
                              <span className="text-foreground">
                                {step.prerequisites.join(", ")}
                              </span>
                            </div>
                          )}
                      </div>

                      {/* Next Step Arrow (except for last step in category) */}
                      {index < categorySteps.length - 1 && (
                        <div className="flex justify-center mt-3">
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Action CTA */}
        <div className="mt-6 p-4 bg-white/40 dark:bg-slate-800/40 rounded-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Ready to start?
              </h4>
              <p className="text-xs text-muted-foreground">
                Begin with the immediate actions for best results.
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Start Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
