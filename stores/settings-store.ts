import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Settings, ChatSettings } from "@/types";

interface SettingsState extends Settings {
  agenticConfig: AgenticConfig;
  setTheme: (theme: Settings["theme"]) => void;
  setVectorStorePath: (path: string | null) => void;
  setEmbeddingModel: (model: string | null) => void;
  setRerankingModel: (model: string | null) => void;
  updateChatSettings: (changes: Partial<ChatSettings>) => void;
  // Enhanced agentic configuration
  setAgenticConfig: (config: Partial<AgenticConfig>) => void;
  resetToDefaults: () => void;
  validateAgenticSetup: () => AgenticValidation;
}

interface AgenticConfig {
  vectorStorePath: string | null;
  embeddingModel: string | null;
  rerankingModel: string | null;
  maxRetrievalDocs: number;
  contextSummaryLength: number;
  historyLimit: number;
  enableQueryRewriting: boolean;
  enableResponseSummarization: boolean;
  cachingEnabled: boolean;
}

interface AgenticValidation {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
  recommendations: string[];
}

const DEFAULT_SETTINGS: Settings & { agenticConfig: AgenticConfig } = {
  theme: "system",
  vectorStorePath: null,
  embeddingModel: "nomic-embed-text", // Better default
  rerankingModel: "llama3.2", // Better default
  chatSettings: {
    model: "llama3.2", // Updated default model
    temperature: 0.7,
    maxTokens: 512, // Increased for better responses
    topP: 0.9,
    topK: 40,
    stream: true,
    systemPrompt: "",
  },
  agenticConfig: {
    vectorStorePath: null,
    embeddingModel: "nomic-embed-text",
    rerankingModel: "llama3.2",
    maxRetrievalDocs: 5,
    contextSummaryLength: 200,
    historyLimit: 10,
    enableQueryRewriting: true,
    enableResponseSummarization: true,
    cachingEnabled: true,
  }
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      
      setTheme: (theme) => set({ theme }),
      setVectorStorePath: (vectorStorePath) => 
        set((state) => ({ 
          vectorStorePath,
          agenticConfig: { ...state.agenticConfig, vectorStorePath }
        })),
      setEmbeddingModel: (embeddingModel) => 
        set((state) => ({ 
          embeddingModel,
          agenticConfig: { ...state.agenticConfig, embeddingModel }
        })),
      setRerankingModel: (rerankingModel) => 
        set((state) => ({ 
          rerankingModel,
          agenticConfig: { ...state.agenticConfig, rerankingModel }
        })),
      updateChatSettings: (changes) =>
        set((state) => ({ chatSettings: { ...state.chatSettings, ...changes } })),
      
      setAgenticConfig: (config) =>
        set((state) => ({
          agenticConfig: { ...state.agenticConfig, ...config },
          // Sync with top-level settings for backward compatibility
          vectorStorePath: config.vectorStorePath ?? state.vectorStorePath,
          embeddingModel: config.embeddingModel ?? state.embeddingModel,
          rerankingModel: config.rerankingModel ?? state.rerankingModel,
        })),
      
      resetToDefaults: () => set(DEFAULT_SETTINGS),
      
      validateAgenticSetup: () => {
        const state = get();
        const { agenticConfig } = state;
        const missingFields: string[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];
        
        if (!agenticConfig.vectorStorePath) {
          missingFields.push("Vector Store Path");
          recommendations.push("Set a local directory for your knowledge base storage");
        }
        
        if (!agenticConfig.embeddingModel) {
          missingFields.push("Embedding Model");
          recommendations.push("Choose an embedding model like 'nomic-embed-text'");
        }
        
        if (!agenticConfig.rerankingModel) {
          warnings.push("No reranking model selected - results may be less accurate");
          recommendations.push("Consider using 'llama3.2' for better result ranking");
        }
        
        if (agenticConfig.maxRetrievalDocs > 10) {
          warnings.push("High document retrieval count may slow performance");
        }
        
        if (state.chatSettings.maxTokens < 256) {
          warnings.push("Low token limit may truncate responses");
          recommendations.push("Consider increasing max tokens to 512 or higher");
        }
        
        return {
          isValid: missingFields.length === 0,
          missingFields,
          warnings,
          recommendations
        };
      }
    }),
    {
      name: "ollama-web-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        vectorStorePath: state.vectorStorePath,
        embeddingModel: state.embeddingModel,
        rerankingModel: state.rerankingModel,
        chatSettings: state.chatSettings,
        agenticConfig: state.agenticConfig,
      }),
    }
  )
);
