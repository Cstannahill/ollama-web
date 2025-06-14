import type { SearchResult } from "@/types";

export class RerankerService {
  async rerank(query: string, results: SearchResult[]): Promise<SearchResult[]> {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const scored = results.map((r) => {
      const text = r.text.toLowerCase();
      const extra = tokens.reduce(
        (acc, t) => (text.includes(t) ? acc + 1 : acc),
        0,
      );
      return { ...r, score: r.score + extra };
    });
    return scored.sort((a, b) => b.score - a.score);
  }
}
