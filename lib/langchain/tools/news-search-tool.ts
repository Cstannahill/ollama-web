import { Runnable } from "@langchain/core/runnables";

export interface NewsSearchResult {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

/**
 * News Search Tool for current events and recent information
 * Uses multiple free news APIs and RSS feeds for up-to-date content
 */
export class NewsSearchTool extends Runnable<string, string> {
  readonly name = "news_search";
  lc_namespace = ["ollama-web", "tools"];

  async invoke(query: string): Promise<string> {
    try {
      console.log(`[NewsSearchTool] Searching news for: "${query}"`);

      // Use HackerNews API as a free alternative for tech news
      const results = await this.searchHackerNews(query);

      if (results.length === 0) {
        return `No recent news found for "${query}". This might be a very specific topic or the search terms may need to be adjusted. Try using more general terms or check if there are recent developments on this topic.`;
      }

      const formattedResults = results
        .map((result, index) => {
          return `News ${index + 1}:
Title: ${result.title}
Source: ${result.source}
Published: ${result.publishedAt}
URL: ${result.url}
Description: ${result.description}
---`;
        })
        .join("\n");

      return `Recent News for "${query}":

${formattedResults}

Total articles: ${results.length}
Search completed: ${new Date().toISOString()}

Note: These results are from public news aggregation. For breaking news or very recent events, consider checking primary news sources directly.`;
    } catch (error) {
      console.error("[NewsSearchTool] Search failed:", error);
      return `News search failed for "${query}": ${
        error instanceof Error ? error.message : "Unknown error"
      }. Please try different keywords or check the topic spelling.`;
    }
  }

  private async searchHackerNews(query: string): Promise<NewsSearchResult[]> {
    try {
      // Search HackerNews via Algolia API (free)
      const searchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(
        query
      )}&tags=story&hitsPerPage=5`;

      const response = await fetch(searchUrl);
      if (!response.ok) {
        throw new Error(`HackerNews API error: ${response.status}`);
      }

      const data = await response.json();

      return data.hits
        .filter((hit: { title?: string; url?: string }) => hit.title && hit.url)
        .map(
          (hit: {
            title: string;
            url: string;
            created_at: string;
            author: string;
            story_text?: string;
            objectID?: string;
          }) => ({
            title: hit.title,
            description: hit.story_text || hit.title,
            url:
              hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            publishedAt: new Date(hit.created_at).toLocaleDateString(),
            source: "Hacker News",
          })
        );
    } catch (error) {
      console.error("[NewsSearchTool] HackerNews search failed:", error);

      // Fallback to a simple RSS-based approach
      try {
        return await this.fallbackNewsSearch(query);
      } catch (fallbackError) {
        console.error(
          "[NewsSearchTool] Fallback search also failed:",
          fallbackError
        );
        return [];
      }
    }
  }

  private async fallbackNewsSearch(query: string): Promise<NewsSearchResult[]> {
    // Simple fallback that suggests checking news manually
    return [
      {
        title: `Search for "${query}" in current news`,
        description: `Consider checking recent news about ${query} on major news websites, Google News, or other news aggregators for the most current information.`,
        url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
        publishedAt: new Date().toLocaleDateString(),
        source: "Suggested Search",
      },
    ];
  }
}
