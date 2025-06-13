import { VectorStore } from "@lancedb/lancedb/web";

export class BrowserVectorStore {
  private db!: unknown;

  async initialize() {
    this.db = await VectorStore.create({
      uri: "indexeddb://ollama-vectors",
    });
  }
}
