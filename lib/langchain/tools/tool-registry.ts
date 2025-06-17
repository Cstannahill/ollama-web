import { Runnable } from "@langchain/core/runnables";
import { WebSearchTool } from "./web-search-tool";
import { WikipediaSearchTool } from "./wikipedia-search-tool";
import { NewsSearchTool } from "./news-search-tool";

export interface ToolConfig {
  enabled: boolean;
  options?: Record<string, unknown>;
}

export interface ToolRegistryConfig {
  webSearch: ToolConfig;
  wikipedia: ToolConfig;
  news: ToolConfig;
}

export interface ToolUsageMetrics {
  toolName: string;
  executionTime: number;
  success: boolean;
  errorMessage?: string;
  timestamp: number;
}

/**
 * Central registry for managing and coordinating all available tools
 * Provides tool selection, execution, and metrics collection
 */
export class ToolRegistry {
  private tools: Map<string, Runnable<string, string>> = new Map();
  private config: ToolRegistryConfig;
  private usageMetrics: ToolUsageMetrics[] = [];

  constructor(config: ToolRegistryConfig) {
    this.config = config;
    this.initializeTools();
  }

  private initializeTools(): void {
    // Initialize enabled tools based on configuration
    if (this.config.webSearch.enabled) {
      this.tools.set(
        "web_search",
        new WebSearchTool(this.config.webSearch.options)
      );
    }

    if (this.config.wikipedia.enabled) {
      this.tools.set("wikipedia_search", new WikipediaSearchTool());
    }

    if (this.config.news.enabled) {
      this.tools.set("news_search", new NewsSearchTool());
    }

    console.log(
      `[ToolRegistry] Initialized ${this.tools.size} tools:`,
      Array.from(this.tools.keys())
    );
  }

  /**
   * Get all enabled tools as an array of Runnable instances
   */
  getEnabledTools(): Runnable<string, string>[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get a specific tool by name
   */
  getTool(name: string): Runnable<string, string> | undefined {
    return this.tools.get(name);
  }

  /**
   * Execute a tool with metrics collection
   */
  async executeTool(toolName: string, input: string): Promise<string> {
    const tool = this.tools.get(toolName);

    if (!tool) {
      const error = `Tool "${toolName}" not found or not enabled`;
      this.recordMetrics(toolName, 0, false, error);
      throw new Error(error);
    }

    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined;
    let result: string;

    try {
      result = await tool.invoke(input);
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : "Unknown error";
      result = `Tool execution failed: ${errorMessage}`;
    }

    const executionTime = Date.now() - startTime;
    this.recordMetrics(toolName, executionTime, success, errorMessage);

    return result;
  }

  /**
   * Intelligently select the best tool for a given query
   */
  selectBestTool(query: string): string | null {
    const lowerQuery = query.toLowerCase();

    // Enhanced keyword detection with scoring
    const newsKeywords = [
      "news",
      "recent",
      "latest",
      "current events",
      "breaking",
      "today",
      "yesterday",
      "this week",
      "happening now",
      "updates",
      "2024",
      "2025",
    ];

    const wikipediaKeywords = [
      "definition",
      "what is",
      "who is",
      "what are",
      "who was",
      "history of",
      "biography",
      "facts about",
      "information about",
      "explain",
      "define",
      "meaning of",
      "concept of",
    ];

    const webSearchKeywords = [
      "how to",
      "tutorial",
      "guide",
      "step by step",
      "instructions",
      "compare",
      "vs",
      "versus",
      "review",
      "price",
      "cost",
      "buy",
      "purchase",
      "best",
      "top",
      "list",
      "recommendations",
      "tips",
      "tricks",
    ];

    // Calculate relevance scores
    const newsScore = this.calculateKeywordScore(lowerQuery, newsKeywords);
    const wikipediaScore = this.calculateKeywordScore(
      lowerQuery,
      wikipediaKeywords
    );
    const webSearchScore = this.calculateKeywordScore(
      lowerQuery,
      webSearchKeywords
    );

    // Determine best tool based on scores and availability
    const scores = [
      {
        tool: "news_search",
        score: newsScore,
        enabled: this.config.news.enabled,
      },
      {
        tool: "wikipedia_search",
        score: wikipediaScore,
        enabled: this.config.wikipedia.enabled,
      },
      {
        tool: "web_search",
        score: webSearchScore,
        enabled: this.config.webSearch.enabled,
      },
    ];

    // Sort by score (highest first) and filter by enabled status
    const validTools = scores
      .filter((item) => item.enabled)
      .sort((a, b) => b.score - a.score);

    if (validTools.length === 0) {
      return null;
    }

    // If top score is significantly higher, use it
    if (validTools[0].score > 0.3) {
      return validTools[0].tool;
    }

    // Default preference order if scores are similar
    if (this.config.webSearch.enabled) return "web_search";
    if (this.config.wikipedia.enabled) return "wikipedia_search";
    if (this.config.news.enabled) return "news_search";

    return null;
  }

  private calculateKeywordScore(query: string, keywords: string[]): number {
    let score = 0;
    const queryWords = query.split(/\s+/);

    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        // Exact phrase match gets higher score
        score += 0.5;
      } else {
        // Check for partial word matches
        const keywordWords = keyword.split(/\s+/);
        const matches = keywordWords.filter((word) =>
          queryWords.some(
            (qWord) => qWord.includes(word) || word.includes(qWord)
          )
        );
        score += (matches.length / keywordWords.length) * 0.2;
      }
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Update tool configuration
   */
  updateConfig(newConfig: Partial<ToolRegistryConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.tools.clear();
    this.initializeTools();
  }

  /**
   * Get tool usage statistics
   */
  getUsageMetrics(): ToolUsageMetrics[] {
    return [...this.usageMetrics];
  }

  /**
   * Get summary statistics for all tools
   */
  getUsageSummary(): Record<
    string,
    { uses: number; avgTime: number; successRate: number }
  > {
    const summary: Record<
      string,
      { uses: number; avgTime: number; successRate: number }
    > = {};

    for (const metric of this.usageMetrics) {
      if (!summary[metric.toolName]) {
        summary[metric.toolName] = { uses: 0, avgTime: 0, successRate: 0 };
      }

      const stats = summary[metric.toolName];
      stats.uses += 1;
      stats.avgTime =
        (stats.avgTime * (stats.uses - 1) + metric.executionTime) / stats.uses;
      stats.successRate =
        this.usageMetrics
          .filter((m) => m.toolName === metric.toolName)
          .reduce((acc, m) => acc + (m.success ? 1 : 0), 0) / stats.uses;
    }

    return summary;
  }

  /**
   * Clear usage metrics
   */
  clearMetrics(): void {
    this.usageMetrics = [];
  }

  private recordMetrics(
    toolName: string,
    executionTime: number,
    success: boolean,
    errorMessage?: string
  ): void {
    this.usageMetrics.push({
      toolName,
      executionTime,
      success,
      errorMessage,
      timestamp: Date.now(),
    });

    // Keep only last 100 metrics to prevent memory bloat
    if (this.usageMetrics.length > 100) {
      this.usageMetrics = this.usageMetrics.slice(-100);
    }
  }

  /**
   * Get available tool names
   */
  getAvailableTools(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Check if a tool is enabled
   */
  isToolEnabled(toolName: string): boolean {
    return this.tools.has(toolName);
  }
}
