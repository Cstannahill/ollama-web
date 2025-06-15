import type { Embedding } from "@/types";

export class EmbeddingService {
  private cache = new Map<string, { value: Embedding; time: number }>();
  private readonly MAX_CACHE = 100;
  private readonly TTL = 86_400_000; // 24h

  constructor(private baseUrl: string) {}

  private setCache(key: string, value: Embedding) {
    this.cache.set(key, { value, time: Date.now() });
    if (this.cache.size > this.MAX_CACHE) {
      const [oldest] = this.cache.keys();
      this.cache.delete(oldest);
    }
  }

  private getCache(key: string): Embedding | undefined {
    const cached = this.cache.get(key);
    if (!cached) return undefined;
    if (Date.now() - cached.time > this.TTL) {
      this.cache.delete(key);
      return undefined;
    }
    this.cache.delete(key);
    this.cache.set(key, cached);
    return cached.value;
  }

  async generateEmbedding(text: string, model: string): Promise<Embedding> {
    const key = `${model}:${text}`;
    const cached = this.getCache(key);
    if (cached) return cached;
    try {
      const res = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: text }),
      });
      if (!res.ok) throw new Error("Failed to generate embedding");
      const data = await res.json();
      const emb = data.embedding as Embedding;
      this.setCache(key, emb);
      return emb;
    } catch (error) {
      console.error("EmbeddingService error", error);
      const emb = Array.from(text).map((c) => c.charCodeAt(0) / 255);
      this.setCache(key, emb);
      return emb;
    }
  }

  async generateEmbeddings(texts: string[], model: string): Promise<Embedding[]> {
    return Promise.all(texts.map((t) => this.generateEmbedding(t, model)));
  }
}
