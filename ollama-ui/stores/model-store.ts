import { create } from "zustand";
import type { Model, PullProgress } from "@/types";
import { OllamaClient } from "@/lib/ollama/client";

interface ModelState {
  available: Model[];
  downloaded: string[];
  downloadProgress: Record<string, number>;
  fetchModels: () => Promise<void>;
  downloadModel: (id: string) => Promise<void>;
}

export const useModelStore = create<ModelState>((set, get) => ({
  available: [],
  downloaded: [],
  downloadProgress: {},
  async fetchModels() {
    const client = new OllamaClient({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });
    const models = await client.listModels();
    set({ available: models });
  },
  async downloadModel(id: string) {
    const client = new OllamaClient({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });
    set((state) => ({
      downloadProgress: { ...state.downloadProgress, [id]: 0 },
    }));
    await client.pullModel(id, (p: PullProgress) => {
      set((state) => ({
        downloadProgress: { ...state.downloadProgress, [id]: p.progress },
      }));
    });
    set((state) => {
      const { [id]: _removed, ...rest } = state.downloadProgress;
      return {
        downloaded: [...state.downloaded, id],
        downloadProgress: rest,
      };
    });
  },
}));
