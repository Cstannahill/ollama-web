import type { RetrieverOptions, SearchResult } from "@/types";
import { vectorStore } from "@/lib/vector";

export class VectorStoreRetriever {
  constructor(private options?: RetrieverOptions) {}

  async getRelevantDocuments(query: string): Promise<SearchResult[]> {
    return vectorStore.search(query, this.options?.filters);
  }
}
