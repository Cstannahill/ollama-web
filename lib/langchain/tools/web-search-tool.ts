import { Runnable } from "@langchain/core/runnables";

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  timestamp?: string;
}

export interface WebSearchOptions {
  maxResults?: number;
  includeImages?: boolean;
  dateRange?: "day" | "week" | "month" | "year";
  safeSearch?: "off" | "moderate" | "strict";
}

/**
 * Web Search Tool for retrieving current information from the internet
 * Uses DuckDuckGo Instant Answer API as a privacy-focused search provider
 */
export class WebSearchTool extends Runnable<string, string> {
  readonly name = "web_search";
  lc_namespace = ["ollama-web", "tools"];

  constructor(private options: WebSearchOptions = {}) {
    super();
  }

  async invoke(query: string): Promise<string> {
    try {
      console.log(`[WebSearchTool] Searching for: "${query}"`);

      // Try multiple search strategies for better results
      const results = await this.performSearch(query);

      if (results.length === 0) {
        return `No current web results found for "${query}". This might be a very specific query or the search APIs may be temporarily unavailable. The assistant will use its training knowledge to help answer your question.`;
      }

      const formattedResults = results
        .map((result, index) => {
          return `Result ${index + 1}:
Title: ${result.title}
URL: ${result.url}
Content: ${result.snippet}
${result.timestamp ? `Retrieved: ${result.timestamp}` : ""}
---`;
        })
        .join("\n");

      return `🌐 Web Search Results for "${query}":

${formattedResults}

Found ${results.length} relevant result${results.length > 1 ? "s" : ""}
Search completed: ${new Date().toISOString()}

Note: These results provide current web information to supplement the assistant's knowledge.`;
    } catch (error) {
      console.error("[WebSearchTool] Search failed:", error);
      return `Web search encountered an issue for "${query}": ${
        error instanceof Error ? error.message : "Unknown error"
      }. The assistant will use its existing knowledge to help with your question.`;
    }
  }

  private async performSearch(query: string): Promise<WebSearchResult[]> {
    // Try DuckDuckGo first
    try {
      const ddgResults = await this.searchDuckDuckGo(query);
      if (ddgResults.length > 0) {
        return ddgResults;
      }
    } catch (error) {
      console.warn("[WebSearchTool] DuckDuckGo search failed:", error);
    }

    // Fallback to other search methods
    try {
      return await this.searchFallback(query);
    } catch (error) {
      console.warn("[WebSearchTool] Fallback search failed:", error);
      return [];
    }
  }

  private async searchDuckDuckGo(query: string): Promise<WebSearchResult[]> {
    // Use DuckDuckGo Instant Answer API
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(
      query
    )}&format=json&no_html=1&skip_disambig=1`;

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Ollama-Web/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo API error: ${response.status}`);
    }

    const data = await response.json();
    const results: WebSearchResult[] = [];

    // Add instant answer if available
    if (data.Answer) {
      results.push({
        title: "Instant Answer",
        url:
          data.AnswerURL ||
          `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: data.Answer,
        timestamp: new Date().toISOString(),
      });
    }

    // Add abstract if available
    if (data.Abstract) {
      results.push({
        title: data.AbstractSource || "Knowledge Base",
        url:
          data.AbstractURL ||
          `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: data.Abstract,
        timestamp: new Date().toISOString(),
      });
    }

    // Add related topics with better filtering
    if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
      const maxResults = this.options.maxResults || 3;
      const validTopics = data.RelatedTopics.filter(
        (topic: { Text?: string; FirstURL?: string }) =>
          topic.Text && topic.FirstURL
      ).slice(0, maxResults);

      for (const topic of validTopics) {
        results.push({
          title: this.extractTitle(topic.Text),
          url: topic.FirstURL,
          snippet: topic.Text,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return results;
  }

  private async searchFallback(query: string): Promise<WebSearchResult[]> {
    // Provide helpful fallback suggestions
    return [
      {
        title: `Search "${query}" manually`,
        url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
        snippet: `For the most current information about "${query}", you can search directly on DuckDuckGo or other search engines. The web search feature may be temporarily unavailable.`,
        timestamp: new Date().toISOString(),
      },
      {
        title: "Alternative search engines",
        url: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
        snippet: `Try searching for "${query}" on Bing, Google, or other search engines for the latest information and comprehensive results.`,
        timestamp: new Date().toISOString(),
      },
    ];
  }

  private extractTitle(text: string): string {
    // Extract a clean title from topic text
    const parts = text.split(" - ");
    if (parts.length > 1) {
      return parts[0].trim();
    }

    // If no dash separator, take first meaningful part
    const words = text.split(" ");
    return words.slice(0, Math.min(6, words.length)).join(" ");
  }
}
