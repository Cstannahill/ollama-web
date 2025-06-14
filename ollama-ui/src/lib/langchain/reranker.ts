import type { SearchResult } from "@/types";

export class Reranker {
  constructor(private model?: string | null) {}

  async rerank(results: SearchResult[]): Promise<SearchResult[]> {
    try {
      return [...results].sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error("Reranker failed", error);
      return results;
    }
  }
}
