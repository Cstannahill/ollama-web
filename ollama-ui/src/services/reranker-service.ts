import type { SearchResult } from "@/types";

export class RerankerService {
  async rerank(query: string, results: SearchResult[]): Promise<SearchResult[]> {
    // Simple lexical scoring fallback
    const scored = results.map((r) => ({
      ...r,
      score: r.score + (r.text.includes(query) ? 1 : 0),
    }));
    return scored.sort((a, b) => b.score - a.score);
  }
}
