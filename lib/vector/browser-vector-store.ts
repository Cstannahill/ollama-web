import type { Document, Embedding } from "@/types";

interface VectorStoreData {
  documents: Document[];
  embeddings: Embedding[];
  metadata: {
    version: string;
    created: number;
    lastModified: number;
  };
}

export class BrowserVectorStore {
  private dbName: string = "ollama-web-vector-store";
  private storeName: string = "documents";
  private db: IDBDatabase | null = null;
  private path: string | null = null;

  async initialize(path: string): Promise<void> {
    this.path = path;

    // For browser environment, use IndexedDB with a database name based on the path
    const sanitizedPath = path.replace(/[^a-zA-Z0-9]/g, "_");
    this.dbName = `ollama-web-vector-store-${sanitizedPath}`;

    await this.initializeIndexedDB();
    console.log(`Vector store initialized with IndexedDB: ${this.dbName}`);
    console.log(`Configured path: ${path} (for reference only in browser)`);
  }

  private async initializeIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(new Error("Failed to open IndexedDB"));

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "id" });
        }
      };
    });
  }

  async saveData(
    documents: Document[],
    embeddings: Embedding[]
  ): Promise<void> {
    if (!this.db) throw new Error("Vector store not initialized");

    const data: VectorStoreData = {
      documents,
      embeddings,
      metadata: {
        version: "1.0.0",
        created: Date.now(),
        lastModified: Date.now(),
      },
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      transaction.onerror = () =>
        reject(new Error("Failed to save vector store data"));
      transaction.oncomplete = () => resolve();

      store.put({ id: "vector-data", ...data });
    });
  }
  async loadData(): Promise<{
    documents: Document[];
    embeddings: Embedding[];
  } | null> {
    if (!this.db) {
      console.warn("Vector store not initialized, attempting to initialize...");
      try {
        await this.initializeIndexedDB();
      } catch (error) {
        console.error("Failed to initialize vector store:", error);
        return null;
      }
    }

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get("vector-data");

      request.onerror = () => {
        console.error("Failed to load vector store data");
        resolve(null); // Return null instead of rejecting to prevent crashes
      };

      request.onsuccess = () => {
        const result = request.result as VectorStoreData | undefined;
        if (result) {
          resolve({
            documents: result.documents || [],
            embeddings: result.embeddings || [],
          });
        } else {
          resolve(null);
        }
      };
    });
  }

  async getStats(): Promise<{
    totalDocs: number;
    dbSize: number;
    lastModified: number | null;
  }> {
    if (!this.db) return { totalDocs: 0, dbSize: 0, lastModified: null };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get("vector-data");

      request.onerror = () =>
        reject(new Error("Failed to get vector store stats"));

      request.onsuccess = () => {
        const result = request.result as VectorStoreData | undefined;
        if (result) {
          resolve({
            totalDocs: result.documents?.length || 0,
            dbSize: JSON.stringify(result).length, // Approximate size
            lastModified: result.metadata?.lastModified || null,
          });
        } else {
          resolve({ totalDocs: 0, dbSize: 0, lastModified: null });
        }
      };
    });
  }

  async clear(): Promise<void> {
    if (!this.db) throw new Error("Vector store not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);

      transaction.onerror = () =>
        reject(new Error("Failed to clear vector store"));
      transaction.oncomplete = () => resolve();

      store.clear();
    });
  }

  getPath(): string | null {
    return this.path;
  }
}
