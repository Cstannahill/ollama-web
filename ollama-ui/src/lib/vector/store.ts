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
  private cacheOrder: string[] = [];
  private readonly MAX_CACHE = 50;
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
    const key = JSON.stringify({ query, filters });
    const cached = this.searchCache.get(key);
    if (cached) {
      this.cacheOrder = this.cacheOrder.filter((k) => k !== key);
      this.cacheOrder.push(key);
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
    const sliced = results.slice(0, filters?.topK || 5);
    this.searchCache.set(key, sliced);
    this.cacheOrder.push(key);
    if (this.cacheOrder.length > this.MAX_CACHE) {
      const oldest = this.cacheOrder.shift();
      if (oldest) this.searchCache.delete(oldest);
    }
    return sliced;
  }
}
