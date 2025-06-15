import type { SearchResult } from "@/types";

export class ContextSummarizer {
  constructor(private maxLength = 200) {}

  async summarize(results: SearchResult[]): Promise<SearchResult[]> {
    try {
      return results.map((r) => ({
        ...r,
        text: r.text.length > this.maxLength
          ? r.text.slice(0, this.maxLength) + "..."
          : r.text,
      }));
    } catch (error) {
      console.error("ContextSummarizer error", error);
      return results;
    }
  }
}
