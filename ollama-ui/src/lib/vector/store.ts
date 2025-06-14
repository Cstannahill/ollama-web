import type {
  Document,
  SearchFilters,
  SearchResult,
  VectorStoreOptions,
  Embedding,
} from "@/types";
import { EmbeddingService } from "@/services/embedding-service";

export class VectorStoreService {
  private initialized = false;
  private docs: Document[] = [];
  private embeddings: Embedding[] = [];
  private searchCache = new Map<string, SearchResult[]>();
  private searchOrder: string[] = [];
  private maxCache = 50;
  private embedder = new EmbeddingService(
    process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  );

  async initialize(options: VectorStoreOptions): Promise<void> {
    void options;
    this.initialized = true;
  }

  async addConversation(conversationId: string, messages: Document[]): Promise<void> {
    void conversationId;
    if (!this.initialized) throw new Error("Vector store not initialized");
    const texts = messages.map((m) => m.text);
    const embs = await this.embedder.generateEmbeddings(
      texts,
      "embedding-model",
    );
    this.docs.push(...messages);
    this.embeddings.push(...embs);
  }

  async search(query: string, filters?: SearchFilters): Promise<SearchResult[]> {
    if (!this.initialized) throw new Error("Vector store not initialized");
    const cacheKey = query + JSON.stringify(filters);
    const cached = this.searchCache.get(cacheKey);
    if (cached) {
      this.searchOrder = this.searchOrder.filter((k) => k !== cacheKey);
      this.searchOrder.push(cacheKey);
      return cached;
    }
    const qEmb = await this.embedder.generateEmbedding(
      query,
      "embedding-model",
    );
    const results: SearchResult[] = this.docs.map((d, i) => {
      const emb = this.embeddings[i];
      const len = Math.min(qEmb.length, emb.length);
      let score = 0;
      for (let j = 0; j < len; j++) score += qEmb[j] * emb[j];
      return { id: d.id, text: d.text, metadata: d.metadata, score };
    });
    results.sort((a, b) => b.score - a.score);
    const top = results.slice(0, filters?.topK || 5);
    this.searchCache.set(cacheKey, top);
    this.searchOrder.push(cacheKey);
    if (this.searchOrder.length > this.maxCache) {
      const old = this.searchOrder.shift();
      if (old) this.searchCache.delete(old);
    }
    return top;
  }
}
