import React, { useState, useEffect, useCallback } from "react";
import { useChatStore } from "@/stores/chat-store";
import { useSettingsStore } from "@/stores/settings-store";
import {
  PresentationalRenderer,
  SmartPresentationalRenderer,
} from "./PresentationalRenderer";
import type {
  PipelineOutput,
  PresentationConfig,
  ContextData,
  ProcessingMetricsData,
} from "@/types/langchain/PipelineOutput";

interface DynamicComponentSelectorProps {
  className?: string;
}

export const DynamicComponentSelector = ({
  className = "",
}: DynamicComponentSelectorProps) => {
  const { messages, status, docs, tools, metrics, thinking, summary } =
    useChatStore();

  const { agenticConfig } = useSettingsStore();
  const [presentationalOutputs, setPresentationalOutputs] = useState<
    PipelineOutput[]
  >([]);
  const [presentationConfig, setPresentationConfig] =
    useState<PresentationConfig>({
      prefer: "detailed",
      theme: "default",
      showMetrics: true,
      showSources: true,
      animationLevel: "subtle",
    });

  // Determine which components should be shown based on context
  const shouldShowComponent = useCallback(
    (type: string): boolean => {
      const currentMessage = messages[messages.length - 1];
      const query = currentMessage?.content.toLowerCase() || "";

      // Don't show certain components during streaming
      if (status && status !== "Completed") {
        return type === "metrics";
      }

      // Context-based visibility
      switch (type) {
        case "metrics":
          return agenticConfig.cachingEnabled && metrics != null;
        case "docs":
          return (
            docs.length > 0 &&
            (query.includes("research") ||
              query.includes("analyze") ||
              query.includes("source") ||
              docs.length <= 5)
          );
        case "tools":
          return (
            tools.length > 0 &&
            (query.includes("search") ||
              query.includes("find") ||
              query.includes("latest") ||
              query.includes("current"))
          );
        case "thinking":
          return (
            thinking != null &&
            (query.includes("explain") ||
              query.includes("reasoning") ||
              query.includes("how") ||
              query.includes("why"))
          );
        case "summary":
          return summary != null && messages.length > 3;
        default:
          return true;
      }
    },
    [
      messages,
      status,
      agenticConfig.cachingEnabled,
      metrics,
      docs.length,
      tools.length,
      thinking,
      summary,
    ]
  );

  // Parse tool output to search results format
  const parseToolToSearchResults = useCallback(
    (tool: { name: string; output: string }) => {
      try {
        if (tool.name.includes("web") || tool.name.includes("search")) {
          const lines = tool.output
            .split("\n")
            .filter((line: string) => line.trim());
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
          return results.slice(0, 4);
        }

        if (tool.name.includes("news")) {
          return [
            {
              title: "News Update",
              url: "#",
              snippet: tool.output.slice(0, 200) + "...",
              source: "news" as const,
              timestamp: new Date().toISOString(),
            },
          ];
        }

        return [];
      } catch {
        return [];
      }
    },
    []
  );

  // Convert chat store state to presentational outputs
  useEffect(() => {
    const outputs: PipelineOutput[] = [];

    // Add metrics if available and not already shown
    if (metrics && shouldShowComponent("metrics")) {
      outputs.push({
        type: "processing-metrics",
        data: {
          startTime: metrics.startTime || Date.now(),
          docsRetrieved: metrics.docsRetrieved || docs.length,
          tokensEstimated: metrics.tokensEstimated || 0,
          totalTime: metrics.totalTime || 0,
          efficiency: metrics.efficiency || 1.0,
          queryRewriteTime: metrics.queryRewriteTime,
          embeddingTime: metrics.embeddingTime,
          retrievalTime: metrics.retrievalTime,
          rerankingTime: metrics.rerankingTime,
          contextTime: metrics.contextTime,
          responseTime: metrics.responseTime,
          tokensPerSecond: metrics.tokensPerSecond,
          toolsUsed: metrics.toolsUsed,
          toolExecutionTime: metrics.toolExecutionTime,
        } as ProcessingMetricsData,
        presentation: { prefer: "visual", showMetrics: true },
      });
    }

    // Add document sources if available
    if (docs.length > 0 && shouldShowComponent("docs")) {
      outputs.push({
        type: "document-sources",
        data: {
          sources: docs.map((doc, index) => ({
            id: `doc-${index}`,
            title: String(doc.metadata?.title || `Document ${index + 1}`),
            snippet: String(doc.text?.slice(0, 200) + "..." || doc.id),
            score: 0.8,
            metadata: {
              source: String(doc.metadata?.source || ""),
              timestamp: Date.now(),
              tags: [],
            },
          })),
          totalRetrieved: docs.length,
          query: messages[messages.length - 1]?.content || "",
          retrievalTime: Date.now(),
        },
        presentation: { showSources: true },
      });
    }

    // Add tool outputs as search results if applicable
    if (tools.length > 0 && shouldShowComponent("tools")) {
      const searchResults = tools
        .filter(
          (tool) => tool.name.includes("search") || tool.name.includes("web")
        )
        .map((tool) => parseToolToSearchResults(tool))
        .flat();

      if (searchResults.length > 0) {
        outputs.push({
          type: "search-results",
          data: {
            results: searchResults,
            query: messages[messages.length - 1]?.content || "",
            searchTime: Date.now(),
          },
          presentation: { showMetrics: true },
        });
      }
    }

    // Add insights from thinking/summary
    if (thinking && shouldShowComponent("thinking")) {
      outputs.push({
        type: "insight",
        data: {
          title: "AI Reasoning",
          content: thinking,
          confidence: 85,
          category: "analysis",
          metadata: {
            complexity: thinking.length > 500 ? "high" : "medium",
            processingTime: Date.now(),
          },
        },
        presentation: { prefer: "detailed" },
      });
    }

    if (summary && shouldShowComponent("summary")) {
      outputs.push({
        type: "insight",
        data: {
          title: "Summary",
          content: summary,
          confidence: 90,
          category: "insight",
          metadata: {
            complexity: "medium",
            processingTime: Date.now(),
          },
        },
        presentation: { prefer: "compact" },
      });
    }

    setPresentationalOutputs(outputs);
  }, [
    metrics,
    docs,
    tools,
    thinking,
    summary,
    shouldShowComponent,
    parseToolToSearchResults,
    messages,
  ]);

  // Auto-configure presentation based on agentic settings
  useEffect(() => {
    const config: PresentationConfig = {
      prefer: agenticConfig.maxRetrievalDocs > 10 ? "compact" : "detailed",
      showMetrics: agenticConfig.cachingEnabled,
      showSources: docs.length > 0,
      animationLevel: "subtle",
      theme: "default",
    };
    setPresentationConfig(config);
  }, [agenticConfig, docs.length]);

  function determineSessionContext():
    | "research"
    | "coding"
    | "general"
    | "analysis" {
    const recentMessages = messages.slice(-3);
    const allText = recentMessages
      .map((m) => m.content.toLowerCase())
      .join(" ");

    if (
      allText.includes("code") ||
      allText.includes("function") ||
      allText.includes("debug")
    ) {
      return "coding";
    }
    if (
      allText.includes("analyze") ||
      allText.includes("compare") ||
      allText.includes("evaluate")
    ) {
      return "analysis";
    }
    if (
      allText.includes("research") ||
      allText.includes("study") ||
      allText.includes("investigate")
    ) {
      return "research";
    }
    return "general";
  }

  // Don't render anything if no presentational outputs
  if (presentationalOutputs.length === 0) {
    return null;
  }

  // Get current context for smart rendering
  const context: ContextData = {
    query: messages[messages.length - 1]?.content || "",
    previousOutputs: presentationalOutputs,
    sessionContext: determineSessionContext(),
    userPreferences: presentationConfig,
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {presentationalOutputs.map((output, index) => (
        <SmartPresentationalRenderer
          key={`${output.type}-${index}`}
          output={output}
          context={context}
          globalConfig={presentationConfig}
        />
      ))}
    </div>
  );
};

// Standalone component for when you want to render specific outputs
export const PresentationalComponent = ({
  type,
  data,
  config,
}: {
  type: string;
  data: unknown;
  config?: PresentationConfig;
}) => {
  const output: PipelineOutput = {
    type: type as
      | "insight"
      | "search-results"
      | "action-plan"
      | "document-sources"
      | "processing-metrics",
    data: data as never,
    presentation: config,
  };

  return <PresentationalRenderer output={output} globalConfig={config} />;
};
