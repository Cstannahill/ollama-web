import React from "react";
import { InsightCard } from "./InsightCard";
import { SearchResultsGrid } from "./SearchResultsGrid";
import { ProcessingMetrics } from "./ProcessingMetrics";
import { DocumentSources } from "./DocumentSources";
import { ActionPlan } from "./ActionPlan";
import type {
  PipelineOutput,
  PresentationConfig,
  ContextData,
} from "@/types/langchain/PipelineOutput";

interface PresentationalRendererProps {
  output: PipelineOutput;
  globalConfig?: PresentationConfig;
}

// Smart component selection based on context and content analysis
export const PresentationalRenderer = ({
  output,
  globalConfig,
}: PresentationalRendererProps) => {
  // Don't render non-presentational types
  if (!isPresentationalOutput(output)) {
    return null;
  }

  const effectiveConfig = {
    ...globalConfig,
    ...output.presentation,
  };

  switch (output.type) {
    case "insight":
      return (
        <InsightCard
          title={output.data.title}
          content={output.data.content}
          confidence={output.data.confidence}
          category={output.data.category}
          metadata={output.data.metadata}
        />
      );

    case "search-results":
      return (
        <SearchResultsGrid
          results={output.data.results}
          query={output.data.query}
          searchTime={output.data.searchTime}
        />
      );

    case "action-plan":
      return (
        <ActionPlan
          title={output.data.title}
          objective={output.data.objective}
          steps={output.data.steps}
          context={output.data.context}
          confidence={output.data.confidence}
        />
      );

    case "document-sources":
      return (
        <DocumentSources
          sources={output.data.sources}
          totalRetrieved={output.data.totalRetrieved}
          query={output.data.query}
          retrievalTime={output.data.retrievalTime}
        />
      );

    case "processing-metrics":
      return (
        <ProcessingMetrics
          metrics={output.data}
          compact={effectiveConfig?.prefer === "compact"}
        />
      );

    default:
      return null;
  }
};

// Enhanced component that analyzes context and automatically selects components
export const SmartPresentationalRenderer = ({
  output,
  context,
  globalConfig,
}: {
  output: PipelineOutput;
  context?: ContextData;
  globalConfig?: PresentationConfig;
}) => {
  // Analyze context to determine optimal presentation
  const optimalConfig = analyzeAndOptimizePresentation(
    output,
    context,
    globalConfig
  );

  // Generate insights from raw data when appropriate
  const enhancedOutput = enhanceOutputWithAI(output, context);

  return (
    <PresentationalRenderer
      output={enhancedOutput}
      globalConfig={optimalConfig}
    />
  );
};

// Helper functions
function isPresentationalOutput(
  output: PipelineOutput
): output is Extract<PipelineOutput, { presentation?: PresentationConfig }> {
  return [
    "insight",
    "search-results",
    "action-plan",
    "document-sources",
    "processing-metrics",
  ].includes(output.type);
}

function analyzeAndOptimizePresentation(
  output: PipelineOutput,
  context?: ContextData,
  globalConfig?: PresentationConfig
): PresentationConfig {
  const baseConfig: PresentationConfig = {
    prefer: "detailed",
    theme: "default",
    showMetrics: true,
    showSources: true,
    animationLevel: "subtle",
    ...globalConfig,
  };

  if (!context) return baseConfig;

  // Analyze query type for presentation hints
  const query = context.query?.toLowerCase() || "";

  // Research-focused queries prefer detailed view with sources
  if (
    query.includes("research") ||
    query.includes("analyze") ||
    query.includes("compare")
  ) {
    return {
      ...baseConfig,
      prefer: "detailed",
      showSources: true,
      showMetrics: true,
    };
  }

  // Quick questions prefer compact view
  if (
    query.includes("quick") ||
    query.includes("brief") ||
    query.includes("summary")
  ) {
    return {
      ...baseConfig,
      prefer: "compact",
      showMetrics: false,
    };
  }

  // Visual/creative queries prefer rich presentation
  if (
    query.includes("visual") ||
    query.includes("design") ||
    query.includes("creative")
  ) {
    return {
      ...baseConfig,
      theme: "rich",
      animationLevel: "full",
    };
  }

  // Context-based optimization
  if (context.sessionContext === "coding") {
    return {
      ...baseConfig,
      prefer: "compact",
      theme: "minimal",
      showSources: false,
    };
  }

  return baseConfig;
}

function enhanceOutputWithAI(
  output: PipelineOutput,
  context?: ContextData
): PipelineOutput {
  // Transform raw outputs into enhanced presentational formats
  switch (output.type) {
    case "docs":
      // Convert document results to enhanced document sources
      const enhancedSources = output.docs.map((doc, index) => ({
        id: `doc-${index}`,
        title: String(doc.metadata?.title || `Document ${index + 1}`),
        snippet: String(doc.text?.slice(0, 200) + "..." || doc.id),
        score: Number(doc.metadata?.score || 0.8),
        metadata: {
          source: String(doc.metadata?.source || ""),
          timestamp: Date.now(),
          tags: extractKeywords(doc.text || ""),
        },
      }));

      return {
        type: "document-sources",
        data: {
          sources: enhancedSources,
          totalRetrieved: output.docs.length,
          query: context?.query || "",
          retrievalTime: Date.now(),
        },
        presentation: { showSources: true, prefer: "detailed" },
      };

    case "tool":
      // Convert tool outputs to search results if applicable
      if (output.name.includes("search") || output.name.includes("web")) {
        const searchResults = parseSearchOutput(output.output);
        if (searchResults.length > 0) {
          return {
            type: "search-results",
            data: {
              results: searchResults,
              query: context?.query || "",
              searchTime: Date.now(),
            },
            presentation: { showMetrics: true },
          };
        }
      }
      break;

    case "summary":
      // Convert summaries to insights
      if (output.message.length > 100) {
        return {
          type: "insight",
          data: {
            title: "Analysis Summary",
            content: output.message,
            confidence: 85,
            category: "analysis",
            metadata: {
              complexity: output.message.length > 500 ? "high" : "medium",
              processingTime: Date.now(),
            },
          },
          presentation: { prefer: "detailed" },
        };
      }
      break;
  }

  return output;
}

// Utility functions for content analysis
function extractKeywords(content: string): string[] {
  const words = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
  const frequency: Record<string, number> = {};

  words.forEach((word) => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([word]) => word);
}

function parseSearchOutput(output: string): Array<{
  title: string;
  url: string;
  snippet: string;
  source: "web" | "wikipedia" | "news";
  timestamp?: string;
  author?: string;
  rating?: number;
}> {
  try {
    const lines = output.split("\n").filter((line) => line.trim());
    const results = [];

    for (let i = 0; i < lines.length; i += 3) {
      if (lines[i] && lines[i + 1] && lines[i + 2]) {
        results.push({
          title: lines[i].replace(/^\d+\.\s*/, ""),
          url: lines[i + 1],
          snippet: lines[i + 2],
          source: "web" as const,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results.slice(0, 6);
  } catch {
    return [];
  }
}
