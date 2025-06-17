import { Runnable } from "@langchain/core/runnables";

export interface WikipediaSearchResult {
  title: string;
  pageId: number;
  url: string;
  extract: string;
  thumbnail?: string;
}

/**
 * Wikipedia Search Tool for reliable, encyclopedic information
 * Uses Wikipedia REST API for structured knowledge retrieval
 */
export class WikipediaSearchTool extends Runnable<string, string> {
  readonly name = "wikipedia_search";
  lc_namespace = ["ollama-web", "tools"];

  async invoke(query: string): Promise<string> {
    try {
      console.log(`[WikipediaSearchTool] Searching Wikipedia for: "${query}"`);

      // First, search for relevant articles
      const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        query
      )}`;

      const response = await fetch(searchUrl, {
        headers: {
          "User-Agent": "Ollama-Web/1.0 (Educational)",
        },
      });

      if (response.status === 404) {
        // Try alternative search if direct lookup fails
        return await this.fallbackSearch(query);
      }

      if (!response.ok) {
        throw new Error(`Wikipedia API error: ${response.status}`);
      }

      const data = await response.json();

      // Format the result
      const result: WikipediaSearchResult = {
        title: data.title,
        pageId: data.pageid,
        url:
          data.content_urls?.desktop?.page ||
          `https://en.wikipedia.org/wiki/${encodeURIComponent(data.title)}`,
        extract: data.extract,
        thumbnail: data.thumbnail?.source,
      };

      return `Wikipedia Search Result for "${query}":

Title: ${result.title}
URL: ${result.url}
${result.thumbnail ? `Image: ${result.thumbnail}` : ""}

Content:
${result.extract}

Source: Wikipedia (Page ID: ${result.pageId})
Retrieved: ${new Date().toISOString()}

Note: This is a summary extract. For complete information, visit the full Wikipedia article.`;
    } catch (error) {
      console.error("[WikipediaSearchTool] Search failed:", error);
      return `Wikipedia search failed for "${query}": ${
        error instanceof Error ? error.message : "Unknown error"
      }. The topic may not exist on Wikipedia or may require a different search term.`;
    }
  }

  private async fallbackSearch(query: string): Promise<string> {
    try {
      // Use Wikipedia's search API for broader results
      const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query
      )}&format=json&origin=*&srlimit=3`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!data.query?.search?.length) {
        return `No Wikipedia articles found for "${query}". Consider using more specific or alternative search terms.`;
      }

      const results = data.query.search.slice(0, 3);
      const formattedResults = results
        .map((result: { title: string; snippet: string }, index: number) => {
          return `${index + 1}. ${result.title}
   URL: https://en.wikipedia.org/wiki/${encodeURIComponent(result.title)}
   Snippet: ${result.snippet.replace(/<[^>]*>/g, "")}
`;
        })
        .join("\n");

      return `Wikipedia Search Results for "${query}":

${formattedResults}

Found ${results.length} related articles. Visit the URLs for complete information.
Retrieved: ${new Date().toISOString()}`;
    } catch (error) {
      console.error("[WikipediaSearchTool] Fallback search failed:", error);
      return `Wikipedia search failed for "${query}". Please try a different search term.`;
    }
  }
}
