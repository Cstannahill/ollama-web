import type {
  Document,
  SearchFilters,
  SearchResult,
  VectorStoreOptions,
  Embedding,
} from "@/types";
import { EmbeddingService } from "@/services/embedding-service";
import { useSettingsStore } from "@/stores/settings-store";
import { OLLAMA_BASE_URL } from "@/lib/config";
import { BrowserVectorStore } from "./browser-vector-store";

export class VectorStoreService {
  private initialized = false;
  private docs: Document[] = [];
  private embeddings: Embedding[] = [];
  private store: BrowserVectorStore | null = null;

  private searchCache = new Map<
    string,
    { results: SearchResult[]; time: number }
  >();

  private cacheOrder: string[] = [];
  private readonly MAX_CACHE = 50;
  private readonly CACHE_TTL = 300_000; // 5 minutes
  private embedder = new EmbeddingService(OLLAMA_BASE_URL);

  async initialize(options?: VectorStoreOptions): Promise<void> {
    if (this.initialized) return;

    // Get settings from store to validate setup
    const settings = useSettingsStore.getState();
    const validation = settings.validateAgenticSetup();

    if (!validation.isValid) {
      console.warn(
        "Vector store initialized with incomplete agentic setup:",
        validation.missingFields
      );
    }

    // Use vector store path from settings if available
    const vectorStorePath =
      settings.agenticConfig.vectorStorePath || options?.storagePath;

    if (vectorStorePath) {
      this.store = new BrowserVectorStore();
      await this.store.initialize(vectorStorePath);
      console.log("Vector store initialized with path:", vectorStorePath);
      console.log(
        "Note: In browser environment, data is persisted to IndexedDB"
      );

      // Load existing data if available
      try {
        const existingData = await this.store.loadData();
        if (existingData) {
          this.docs = existingData.documents;
          this.embeddings = existingData.embeddings;
          console.log(
            `Loaded ${this.docs.length} documents from persistent storage`
          );
        }
      } catch (error) {
        console.warn("Failed to load existing vector data:", error);
        // Continue with empty vectors rather than failing initialization
      }
    }

    this.initialized = true;
  }
  async addConversation(
    conversationId: string,
    messages: Document[]
  ): Promise<void> {
    void conversationId;
    if (!this.initialized) throw new Error("Vector store not initialized");

    // Get embedding model from settings
    const settings = useSettingsStore.getState();
    const embeddingModel =
      settings.agenticConfig.embeddingModel || "nomic-embed-text";

    const texts = messages.map((m) => m.text);
    try {
      const embs = await this.embedder.generateEmbeddings(
        texts,
        embeddingModel
      );
      this.docs.push(...messages);
      this.embeddings.push(...embs);

      // Persist to storage if available
      if (this.store) {
        await this.store.saveData(this.docs, this.embeddings);
        console.log(`Persisted ${this.docs.length} total documents to storage`);
      }
    } catch (error) {
      console.error("Failed to add conversation to vector store:", error);
      throw new Error(
        `Vector store operation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  async search(
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResult[]> {
    if (!this.initialized) throw new Error("Vector store not initialized");

    // Get settings for caching and embedding model
    const settings = useSettingsStore.getState();
    const cachingEnabled = settings.agenticConfig.cachingEnabled;
    const embeddingModel =
      settings.agenticConfig.embeddingModel || "nomic-embed-text";
    const maxRetrievalDocs = settings.agenticConfig.maxRetrievalDocs || 5;

    const key = JSON.stringify({ query, filters, embeddingModel });
    const cached = this.searchCache.get(key);

    // Use cache only if caching is enabled
    if (cachingEnabled && cached && Date.now() - cached.time < this.CACHE_TTL) {
      this.cacheOrder = this.cacheOrder.filter((k) => k !== key);
      this.cacheOrder.push(key);
      return cached.results;
    }

    try {
      const qEmb = await this.embedder.generateEmbedding(query, embeddingModel);
      const results: SearchResult[] = this.docs.map((d, i) => {
        const emb = this.embeddings[i];
        const len = Math.min(qEmb.length, emb.length);
        let score = 0;
        for (let j = 0; j < len; j++) score += qEmb[j] * emb[j];
        return { id: d.id, text: d.text, metadata: d.metadata, score };
      });

      results.sort((a, b) => b.score - a.score);
      const topK = filters?.topK || maxRetrievalDocs;
      const sliced = results.slice(0, topK);

      if (cachingEnabled) {
        this.searchCache.set(key, { results: sliced, time: Date.now() });
        this.cacheOrder.push(key);
        if (this.cacheOrder.length > this.MAX_CACHE) {
          const oldest = this.cacheOrder.shift();
          if (oldest) this.searchCache.delete(oldest);
        }
      }

      return sliced;
    } catch (error) {
      console.error("Vector store search failed:", error);
      throw new Error(
        `Vector search failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Add method to clear cache when settings change
  clearCache(): void {
    this.searchCache.clear();
    this.cacheOrder = [];
  }
  // Add method to get current store statistics
  getStats(): {
    totalDocs: number;
    cacheSize: number;
    initialized: boolean;
    storagePath?: string;
  } {
    return {
      totalDocs: this.docs.length,
      cacheSize: this.searchCache.size,
      initialized: this.initialized,
      storagePath: this.store?.getPath() || undefined,
    };
  }

  // Add method to manually save current state
  async saveToStorage(): Promise<void> {
    if (this.store && this.initialized) {
      await this.store.saveData(this.docs, this.embeddings);
      console.log(`Manually saved ${this.docs.length} documents to storage`);
    }
  }

  // Add method to get storage statistics
  async getStorageStats(): Promise<{
    totalDocs: number;
    dbSize: number;
    lastModified: number | null;
  } | null> {
    if (this.store) {
      return await this.store.getStats();
    }
    return null;
  }

  // Add method to clear all data
  async clearAll(): Promise<void> {
    this.docs = [];
    this.embeddings = [];
    this.clearCache();

    if (this.store) {
      await this.store.clear();
      console.log("Cleared all vector store data");
    }
  }
}
