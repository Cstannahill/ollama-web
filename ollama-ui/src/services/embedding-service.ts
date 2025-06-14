import type { Embedding } from "@/types";

export class EmbeddingService {
  constructor(private baseUrl: string) {}

  async generateEmbedding(text: string, model: string): Promise<Embedding> {
    try {
      const res = await fetch(`${this.baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: text }),
      });
      if (!res.ok) throw new Error("Failed to generate embedding");
      const data = await res.json();
      return data.embedding as Embedding;
    } catch (error) {
      console.error("EmbeddingService error", error);
      // Fallback simple embedding
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
