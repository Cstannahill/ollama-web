import { create } from "zustand";
import type { Model, PullProgress } from "@/types";
import { OllamaClient } from "@/lib/ollama/client";
import { OLLAMA_BASE_URL } from "@/lib/config";

interface ModelState {
  available: Model[];
  downloaded: string[];
  downloadProgress: Record<string, number>;
  usage: Record<string, { uses: number; lastUsed: string | null }>;
  error: string | null;
  fetchModels: () => Promise<void>;
  downloadModel: (id: string) => Promise<void>;
  deleteModels: (ids: string[]) => void;
  markUsed: (id: string) => void;
}

export const useModelStore = create<ModelState>((set, get) => ({
  available: [],
  downloaded: [],
  downloadProgress: {},
  usage: {},
  error: null,
  async fetchModels() {
    try {
      const client = new OllamaClient({
        baseUrl: OLLAMA_BASE_URL,
      });
      const models = await client.listModels();
      set({ available: models, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
  async downloadModel(id: string) {
    try {
      const client = new OllamaClient({
        baseUrl: OLLAMA_BASE_URL,
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
          usage: {
            ...state.usage,
            [id]: { uses: 0, lastUsed: null },
          },
        };
      });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
  deleteModels(ids: string[]) {
    set((state) => ({
      downloaded: state.downloaded.filter((d) => !ids.includes(d)),
      usage: Object.fromEntries(
        Object.entries(state.usage).filter(([k]) => !ids.includes(k)),
      ),
    }));
  },
  markUsed(id: string) {
    set((state) => ({
      usage: {
        ...state.usage,
        [id]: {
          uses: (state.usage[id]?.uses || 0) + 1,
          lastUsed: new Date().toISOString(),
        },
      },
    }));
  },
}));
