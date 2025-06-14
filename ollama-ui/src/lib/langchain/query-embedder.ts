import type { Embedding } from "@/types";

export class QueryEmbedder {
  constructor(private model?: string | null) {}

  async embed(text: string): Promise<Embedding> {
    try {
      void text;
      // Placeholder for actual embedding logic
      return [];
    } catch (error) {
      console.error("Embedder failed", error);
      return [];
    }
  }
}
