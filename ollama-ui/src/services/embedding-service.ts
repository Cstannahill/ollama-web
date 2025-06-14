import type { Embedding } from "@/types";

export class EmbeddingService {
  private cache = new Map<string, { value: Embedding; time: number }>();
  private readonly MAX_CACHE = 100;
  private readonly TTL = 86_400_000; // 24h

  constructor(private baseUrl: string) {}

  async generateEmbedding(text: string, model: string): Promise<Embedding> {
    const key = `${model}:${text}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.time < this.TTL) {
      this.cache.delete(key);
      this.cache.set(key, cached); // refresh order
      return cached.value;
    }
    try {
      const res = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: text }),
      });
      if (!res.ok) throw new Error("Failed to generate embedding");
      const data = await res.json();
      const emb = data.embedding as Embedding;
      this.cache.set(key, { value: emb, time: Date.now() });
      if (this.cache.size > this.MAX_CACHE) {
        const [oldest] = this.cache.keys();
        this.cache.delete(oldest);
      }
      return emb;
    } catch (error) {
      console.error("EmbeddingService error", error);
      return Array.from(text).map((c) => c.charCodeAt(0) / 255);
    }
  }

  async generateEmbeddings(texts: string[], model: string): Promise<Embedding[]> {
    const embeddings: Embedding[] = [];
    for (const t of texts) {
      embeddings.push(await this.generateEmbedding(t, model));
    }
    return embeddings;
  }
}
