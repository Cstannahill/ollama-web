"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronUp,
  Brain,
  Hash,
  MessageSquare,
  TrendingUp,
  BarChart3,
  Tag,
} from "lucide-react";

interface MultiTurnSummaryProps {
  summary: string;
  metrics: {
    entityOverlap: number;
    topicContinuity: number;
    contextualRelevance: number;
  };
  className?: string;
}

interface ParsedSummaryData {
  turns: number;
  entities: string[];
  topics: string[];
  headerText: string;
}

export function MultiTurnSummary({
  summary,
  metrics,
  className = "",
}: MultiTurnSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 0.4) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  const formatPercentage = (value: number) => `${Math.round(value * 100)}%`;

  // Parse the summary to extract structured information
  function parseSummaryData(summaryText: string): ParsedSummaryData {
    const lines = summaryText.split("\n").filter((line) => line.trim());

    const data: ParsedSummaryData = {
      turns: 0,
      entities: [],
      topics: [],
      headerText: "Multi-turn context analysis",
    };

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (trimmed.includes("Analyzed") && trimmed.includes("turns")) {
        const match = trimmed.match(/(\d+)\s+(?:previous\s+)?turns?/i);
        if (match) data.turns = parseInt(match[1], 10);
      } else if (trimmed.includes("Key entities:")) {
        const entitiesText = trimmed.replace(/^.*Key entities:\s*/i, "");
        data.entities = entitiesText
          .split(",")
          .map((e) => e.trim())
          .filter(Boolean);
      } else if (trimmed.includes("Main topics:")) {
        const topicsText = trimmed.replace(/^.*Main topics:\s*/i, "");
        data.topics = topicsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (trimmed.includes("Multi-turn context analysis")) {
        data.headerText = trimmed;
      }
    });

    return data;
  }

  const parsedData = parseSummaryData(summary);

  return (
    <Card className={`border-blue-200 bg-blue-50/50 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Multi-Turn Analysis
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 text-blue-600 hover:text-blue-800"
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Summary Info */}
        <div className="flex items-center gap-4 mb-3 text-sm text-blue-700">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{parsedData.turns} turns analyzed</span>
          </div>
          {parsedData.entities.length > 0 && (
            <div className="flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span>{parsedData.entities.length} entities</span>
            </div>
          )}
          {parsedData.topics.length > 0 && (
            <div className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              <span>{parsedData.topics.length} topics</span>
            </div>
          )}
        </div>

        {/* Compact metrics view - always visible */}
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge
            variant="outline"
            className={`text-xs ${getScoreColor(metrics.entityOverlap)}`}
          >
            <Hash className="h-3 w-3 mr-1" />
            Entity: {formatPercentage(metrics.entityOverlap)}
          </Badge>

          <Badge
            variant="outline"
            className={`text-xs ${getScoreColor(metrics.topicContinuity)}`}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Topic: {formatPercentage(metrics.topicContinuity)}
          </Badge>

          <Badge
            variant="outline"
            className={`text-xs ${getScoreColor(metrics.contextualRelevance)}`}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Relevance: {formatPercentage(metrics.contextualRelevance)}
          </Badge>
        </div>

        {/* Expanded view */}
        {isExpanded && (
          <div className="space-y-4 mt-4 pt-3 border-t border-blue-200">
            {/* Entities and Topics */}
            {(parsedData.entities.length > 0 ||
              parsedData.topics.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {parsedData.entities.length > 0 && (
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Hash className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Key Entities
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {parsedData.entities.slice(0, 8).map((entity, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {entity}
                        </Badge>
                      ))}
                      {parsedData.entities.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{parsedData.entities.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {parsedData.topics.length > 0 && (
                  <div className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Main Topics
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {parsedData.topics.slice(0, 6).map((topic, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {topic}
                        </Badge>
                      ))}
                      {parsedData.topics.length > 6 && (
                        <Badge variant="outline" className="text-xs">
                          +{parsedData.topics.length - 6} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Detailed metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-3 border">
                <div className="flex items-center gap-2 mb-1">
                  <Hash className="h-4 w-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-700">
                    Entity Overlap
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPercentage(metrics.entityOverlap)}
                </div>
                <div className="text-xs text-gray-500">
                  Named entities shared across turns
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-medium text-gray-700">
                    Topic Continuity
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPercentage(metrics.topicContinuity)}
                </div>
                <div className="text-xs text-gray-500">
                  Consistent themes and subjects
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 border">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <span className="text-xs font-medium text-gray-700">
                    Context Relevance
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatPercentage(metrics.contextualRelevance)}
                </div>
                <div className="text-xs text-gray-500">
                  Multi-turn context effectiveness
                </div>
              </div>
            </div>

            {/* Quality indicator */}
            <div className="bg-white rounded-lg p-3 border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-indigo-500" />
                <span className="text-sm font-medium text-gray-700">
                  Context Quality
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.max(20, ((metrics.entityOverlap + metrics.topicContinuity + metrics.contextualRelevance) / 3) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(
                    ((metrics.entityOverlap +
                      metrics.topicContinuity +
                      metrics.contextualRelevance) /
                      3) *
                      100
                  )}
                  %
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Overall conversation coherence and context retention
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MultiTurnSummary;
