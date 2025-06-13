export interface SearchResult {
  id: string;
  score: number;
  text: string;
  metadata?: Record<string, unknown>;
}
