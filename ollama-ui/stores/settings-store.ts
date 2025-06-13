import { create } from "zustand";
import type { Settings, ChatSettings } from "@/types";

interface SettingsState extends Settings {
  setTheme: (theme: Settings["theme"]) => void;
  setVectorStorePath: (path: string | null) => void;
  setEmbeddingModel: (model: string | null) => void;
  setRerankingModel: (model: string | null) => void;
  updateChatSettings: (changes: Partial<ChatSettings>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: "system",
  vectorStorePath: null,
  embeddingModel: null,
  rerankingModel: null,
  chatSettings: { temperature: 0.7, maxTokens: 256 },
  setTheme: (theme) => set({ theme }),
  setVectorStorePath: (vectorStorePath) => set({ vectorStorePath }),
  setEmbeddingModel: (embeddingModel) => set({ embeddingModel }),
  setRerankingModel: (rerankingModel) => set({ rerankingModel }),
  updateChatSettings: (changes) =>
    set((state) => ({ chatSettings: { ...state.chatSettings, ...changes } })),
}));
