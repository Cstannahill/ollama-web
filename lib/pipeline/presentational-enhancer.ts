import {
  PipelineOutput,
  InsightData,
  SearchResultData,
  ActionStepData,
  DocumentSourceData,
  ProcessingMetricsData,
} from "@/types/langchain/PipelineOutput";
import type { SearchResult } from "@/types/vector";

/**
 * Enhanced pipeline utilities that transform raw data into presentational formats
 * These functions analyze content and create structured data for beautiful UI components
 */

export class PresentationalPipelineEnhancer {
  /**
   * Analyzes raw text and creates an insight card if the content is analytical
   */
  static createInsightFromText(
    text: string,
    title?: string,
    category?: "analysis" | "recommendation" | "insight" | "warning"
  ): PipelineOutput | null {
    // Don't create insights for very short text
    if (text.length < 50) return null;

    // Analyze text to determine if it's insightful
    const isAnalytical = this.containsAnalyticalContent(text);
    const confidence = this.calculateConfidence(text);

    if (!isAnalytical || confidence < 60) return null;

    const insight: InsightData = {
      title: title || this.extractTitle(text),
      content: text,
      confidence: confidence,
      category: category || this.determineCategory(text),
      metadata: {
        processingTime: Date.now(),
        complexity: this.assessComplexity(text),
        sources: this.extractMentionedSources(text),
      },
    };

    return {
      type: "insight",
      data: insight,
      presentation: {
        prefer: text.length > 500 ? "detailed" : "compact",
        showMetrics: true,
      },
    };
  }

  /**
   * Transforms search tool outputs into beautiful search result grids
   */
  static createSearchResultsFromToolOutput(
    toolOutput: string,
    toolName: string
  ): PipelineOutput | null {
    try {
      const results = this.parseSearchOutput(toolOutput, toolName);
      if (results.length === 0) return null;

      return {
        type: "search-results",
        data: {
          results: results,
          query: "search query",
          searchTime: Date.now(),
        },
        presentation: {
          prefer: results.length > 4 ? "compact" : "detailed",
          showMetrics: true,
        },
      };
    } catch {
      return null;
    }
  }

  /**
   * Creates an action plan from instructional or procedural text
   */
  static createActionPlanFromText(text: string): PipelineOutput | null {
    const steps = this.extractActionSteps(text);
    if (steps.length < 2) return null;

    return {
      type: "action-plan",
      data: {
        title: "Action Plan",
        objective: "Complete the following steps",
        steps: steps,
        context: text.slice(0, 200) + "...",
        confidence: 85,
      },
      presentation: {
        prefer: "detailed",
        showMetrics: true,
      },
    };
  }

  /**
   * Transforms document results into enhanced document sources
   */
  static createDocumentSourcesFromDocs(
    docs: SearchResult[]
  ): PipelineOutput | null {
    if (docs.length === 0) return null;

    const sources: DocumentSourceData[] = docs.map((doc, index) => ({
      id: `doc-${index}`,
      title: String(doc.metadata?.title || `Document ${index + 1}`),
      snippet: this.createSmartExcerpt(
        doc.text || String(doc.metadata?.content) || doc.id
      ),
      score: Number(doc.score || 0.8),
      metadata: {
        source: String(doc.metadata?.source || "document"),
        timestamp: Date.now(),
        tags: this.extractKeywords(
          doc.text || String(doc.metadata?.content) || ""
        ),
        pageNumber: Number(doc.metadata?.pageNumber) || undefined,
        section: String(doc.metadata?.section) || undefined,
      },
    }));

    return {
      type: "document-sources",
      data: {
        sources: sources,
        totalRetrieved: docs.length,
        query: "document search",
        retrievalTime: Date.now(),
      },
      presentation: {
        prefer: sources.length > 3 ? "compact" : "detailed",
        showSources: true,
      },
    };
  }

  /**
   * Enhanced metrics presentation
   */
  static createProcessingMetrics(
    metricsData: Record<string, unknown>
  ): PipelineOutput {
    return {
      type: "processing-metrics",
      data: {
        startTime: Number(metricsData.startTime) || Date.now(),
        docsRetrieved: Number(metricsData.docsRetrieved) || 0,
        tokensEstimated: Number(metricsData.tokensEstimated) || 0,
        totalTime: Number(metricsData.totalTime) || 0,
        efficiency: this.calculateEfficiency(metricsData),
        tokensPerSecond: this.calculateTokensPerSecond(metricsData),
        ...metricsData,
      } as ProcessingMetricsData,
      presentation: {
        prefer: "visual",
        showMetrics: true,
      },
    };
  }

  // Private helper methods
  private static containsAnalyticalContent(text: string): boolean {
    const analyticalKeywords = [
      "analyze",
      "analysis",
      "conclude",
      "therefore",
      "however",
      "furthermore",
      "in contrast",
      "consequently",
      "moreover",
      "nevertheless",
      "thus",
      "indicates",
      "suggests",
      "implies",
      "reveals",
      "demonstrates",
      "evidence",
      "pattern",
      "trend",
      "correlation",
      "relationship",
    ];

    const lowerText = text.toLowerCase();
    return analyticalKeywords.some((keyword) => lowerText.includes(keyword));
  }

  private static calculateConfidence(text: string): number {
    let confidence = 50; // Base confidence

    // Boost confidence for longer, more detailed text
    if (text.length > 200) confidence += 20;
    if (text.length > 500) confidence += 10;

    // Boost for analytical language
    if (this.containsAnalyticalContent(text)) confidence += 15;

    // Boost for structured content
    if (text.includes("\n") && text.includes("-")) confidence += 10;

    // Penalize very short or vague content
    if (text.length < 100) confidence -= 20;

    return Math.min(95, Math.max(10, confidence));
  }

  private static extractTitle(text: string): string {
    // Try to extract a title from the first sentence or line
    const firstLine = text.split("\n")[0];
    const firstSentence = text.split(".")[0];

    // Use the shorter, more title-like option
    const candidate =
      firstLine.length < firstSentence.length ? firstLine : firstSentence;

    // Clean up and truncate if needed
    return candidate.slice(0, 60).trim() + (candidate.length > 60 ? "..." : "");
  }

  private static determineCategory(
    text: string
  ): "analysis" | "recommendation" | "insight" | "warning" {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("recommend") ||
      lowerText.includes("should") ||
      lowerText.includes("suggest")
    ) {
      return "recommendation";
    }
    if (
      lowerText.includes("warning") ||
      lowerText.includes("caution") ||
      lowerText.includes("risk")
    ) {
      return "warning";
    }
    if (
      lowerText.includes("analyze") ||
      lowerText.includes("study") ||
      lowerText.includes("examine")
    ) {
      return "analysis";
    }

    return "insight";
  }

  private static assessComplexity(text: string): "low" | "medium" | "high" {
    if (text.length < 200) return "low";
    if (text.length < 500) return "medium";
    return "high";
  }

  private static extractMentionedSources(text: string): string[] {
    // Simple regex to find URLs or source mentions
    const urlRegex = /https?:\/\/[^\s]+/g;
    const sourceRegex = /according to ([^,.\n]+)/gi;

    const urls = text.match(urlRegex) || [];
    const sources = text.match(sourceRegex) || [];

    return [...urls, ...sources].slice(0, 5);
  }

  private static parseSearchOutput(
    output: string,
    toolName: string
  ): SearchResultData[] {
    const results: SearchResultData[] = [];

    if (toolName.includes("web") || toolName.includes("search")) {
      // Parse web search results
      const lines = output.split("\n").filter((line) => line.trim());

      for (let i = 0; i < lines.length; i += 3) {
        if (lines[i] && lines[i + 1] && lines[i + 2]) {
          results.push({
            title: lines[i].replace(/^\d+\.\s*/, ""),
            url: lines[i + 1],
            snippet: lines[i + 2],
            source: "web" as const,
            timestamp: new Date().toISOString(),
            rating: 0.8,
          });
        }
      }
    } else if (toolName.includes("wikipedia")) {
      // Parse Wikipedia results
      results.push({
        title: "Wikipedia Article",
        url: "https://wikipedia.org",
        snippet: output.slice(0, 200) + "...",
        source: "wikipedia" as const,
        timestamp: new Date().toISOString(),
        rating: 0.9,
      });
    } else if (toolName.includes("news")) {
      // Parse news results
      results.push({
        title: "Latest News",
        url: "#",
        snippet: output.slice(0, 200) + "...",
        source: "news" as const,
        timestamp: new Date().toISOString(),
        rating: 0.85,
      });
    }

    return results.slice(0, 6);
  }

  private static extractActionSteps(text: string): ActionStepData[] {
    const steps: ActionStepData[] = [];

    // Look for numbered steps or bullet points
    const stepPatterns = [
      /^\d+\.\s*(.+)$/gm, // 1. Step
      /^Step \d+:?\s*(.+)$/gim, // Step 1: Description
      /^-\s*(.+)$/gm, // - Step
      /^\*\s*(.+)$/gm, // * Step
    ];

    let stepNumber = 1;

    for (const pattern of stepPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (steps.length < 10) {
          // Limit to 10 steps
          steps.push({
            id: `step-${stepNumber++}`,
            title: match[1].slice(0, 50),
            description: match[1],
            priority: "medium" as const,
            category: "short-term" as const,
            estimatedTime: "30 minutes",
            difficulty:
              match[1].length > 100 ? ("hard" as const) : ("medium" as const),
          });
        }
      }

      if (steps.length > 0) break; // Use first matching pattern
    }

    return steps;
  }

  private static createSmartExcerpt(text: string): string {
    if (text.length <= 200) return text;

    // Try to find a good breaking point near 200 characters
    const ideal = text.slice(0, 200);
    const lastSpace = ideal.lastIndexOf(" ");
    const lastPeriod = ideal.lastIndexOf(".");

    // Use the best breaking point
    const breakPoint =
      lastPeriod > 150 ? lastPeriod + 1 : lastSpace > 150 ? lastSpace : 200;

    return text.slice(0, breakPoint).trim() + "...";
  }

  private static inferDocumentType(
    content: string
  ): "document" | "webpage" | "knowledge-base" | "manual" {
    if (content.includes("<!DOCTYPE") || content.includes("<html"))
      return "webpage";
    if (content.includes("# ") && content.includes("## "))
      return "knowledge-base";
    if (content.includes("Step ") || content.includes("Instructions"))
      return "manual";
    return "document";
  }

  private static extractKeywords(content: string): string[] {
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

  private static extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "Unknown Source";
    }
  }

  private static calculateEfficiency(metrics: Record<string, unknown>): number {
    const totalTime = Number(metrics.totalTime) || 0;
    const docsRetrieved = Number(metrics.docsRetrieved) || 0;
    if (!totalTime || !docsRetrieved) return 0;
    return totalTime / Math.max(1, docsRetrieved);
  }

  private static calculateTokensPerSecond(
    metrics: Record<string, unknown>
  ): number {
    const totalTime = Number(metrics.totalTime) || 0;
    const tokensEstimated = Number(metrics.tokensEstimated) || 0;
    if (!totalTime || !tokensEstimated) return 0;
    return (tokensEstimated / totalTime) * 1000; // Convert to per second
  }
}
