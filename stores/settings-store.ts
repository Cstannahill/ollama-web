import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Settings, ChatSettings } from "@/types";

// Helper function to get default vector store path
const getDefaultVectorStorePath = (): string => {
  if (typeof window !== "undefined") {
    // Browser environment - use a default identifier
    return "ollama-web-documents";
  }

  // Node.js environment (like Tauri/Electron) - use user documents folder
  return "ollama-web-documents"; // Simplified fallback for all environments
};

interface SettingsState extends Settings {
  agenticConfig: AgenticConfig;
  agenticPresets: AgenticPreset[];
  setTheme: (theme: Settings["theme"]) => void;
  setVectorStorePath: (path: string | null) => void;
  setEmbeddingModel: (model: string | null) => void;
  setRerankingModel: (model: string | null) => void;
  updateChatSettings: (changes: Partial<ChatSettings>) => void;
  // Enhanced agentic configuration
  setAgenticConfig: (config: Partial<AgenticConfig>) => void;
  // Tool management methods
  setToolsEnabled: (enabled: boolean) => void;
  setWebSearchEnabled: (enabled: boolean) => void;
  setWikipediaEnabled: (enabled: boolean) => void;
  setNewsSearchEnabled: (enabled: boolean) => void;
  updateToolConfig: (
    config: Partial<
      Pick<
        AgenticConfig,
        | "toolsEnabled"
        | "webSearchEnabled"
        | "wikipediaEnabled"
        | "newsSearchEnabled"
      >
    >
  ) => void;
  resetToDefaults: () => void;
  validateAgenticSetup: () => AgenticValidation;
  // Preset management
  savePreset: (name: string, description: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  exportPresets: () => string;
  importPresets: (presetsJson: string) => boolean;
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
  toolsEnabled: boolean;
  webSearchEnabled: boolean;
  wikipediaEnabled: boolean;
  newsSearchEnabled: boolean;
  // Enhanced timeout configuration
  stepTimeouts?: {
    queryRewrite?: number;
    embedding?: number;
    retrieval?: number;
    reranking?: number;
    contextBuilding?: number;
    generation?: number;
    tools?: number;
  };
}

interface AgenticValidation {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
  recommendations: string[];
}

interface AgenticPreset {
  id: string;
  name: string;
  description: string;
  config: AgenticConfig;
  createdAt: number;
}

const DEFAULT_PRESETS: AgenticPreset[] = [
  {
    id: "balanced",
    name: "Balanced",
    description: "Good balance of speed and quality for general use",
    config: {
      vectorStorePath: getDefaultVectorStorePath(),
      embeddingModel: "nomic-embed-text",
      rerankingModel: "llama3.2",
      maxRetrievalDocs: 5,
      contextSummaryLength: 200,
      historyLimit: 10,
      enableQueryRewriting: true,
      enableResponseSummarization: true,
      cachingEnabled: true,
      toolsEnabled: true,
      webSearchEnabled: true,
      wikipediaEnabled: true,
      newsSearchEnabled: true,
      stepTimeouts: {
        queryRewrite: 30000,
        embedding: 45000,
        retrieval: 60000,
        reranking: 30000,
        contextBuilding: 20000,
        generation: 180000,
        tools: 45000,
      },
    },
    createdAt: Date.now(),
  },
  {
    id: "fast",
    name: "Fast",
    description: "Optimized for speed with minimal processing",
    config: {
      vectorStorePath: getDefaultVectorStorePath(),
      embeddingModel: "nomic-embed-text",
      rerankingModel: null,
      maxRetrievalDocs: 3,
      contextSummaryLength: 100,
      historyLimit: 5,
      enableQueryRewriting: false,
      enableResponseSummarization: false,
      cachingEnabled: true,
      toolsEnabled: true,
      webSearchEnabled: true,
      wikipediaEnabled: false, // Disabled for speed
      newsSearchEnabled: false, // Disabled for speed
      stepTimeouts: {
        queryRewrite: 15000, // Faster timeouts
        embedding: 20000,
        retrieval: 30000,
        reranking: 15000,
        contextBuilding: 10000,
        generation: 90000, // 1.5 minutes
        tools: 20000,
      },
    },
    createdAt: Date.now(),
  },
  {
    id: "quality",
    name: "High Quality",
    description: "Maximum quality with comprehensive processing",
    config: {
      vectorStorePath: getDefaultVectorStorePath(),
      embeddingModel: "nomic-embed-text",
      rerankingModel: "llama3.2",
      maxRetrievalDocs: 10,
      contextSummaryLength: 500,
      historyLimit: 20,
      enableQueryRewriting: true,
      enableResponseSummarization: true,
      cachingEnabled: true,
      toolsEnabled: true,
      webSearchEnabled: true,
      wikipediaEnabled: true,
      newsSearchEnabled: true,
      stepTimeouts: {
        queryRewrite: 60000, // Generous timeouts for quality
        embedding: 90000,
        retrieval: 120000,
        reranking: 60000,
        contextBuilding: 45000,
        generation: 300000, // 5 minutes
        tools: 90000,
      },
    },
    createdAt: Date.now(),
  },
];

const DEFAULT_SETTINGS: Settings & {
  agenticConfig: AgenticConfig;
  agenticPresets: AgenticPreset[];
} = {
  theme: "system",
  vectorStorePath: getDefaultVectorStorePath(),
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
    vectorStorePath: getDefaultVectorStorePath(),
    embeddingModel: "nomic-embed-text",
    rerankingModel: "llama3.2",
    maxRetrievalDocs: 5,
    contextSummaryLength: 200,
    historyLimit: 10,
    enableQueryRewriting: true,
    enableResponseSummarization: true,
    cachingEnabled: true,
    toolsEnabled: true,
    webSearchEnabled: true,
    wikipediaEnabled: true,
    newsSearchEnabled: true,
    stepTimeouts: {
      queryRewrite: 30000,
      embedding: 45000,
      retrieval: 60000,
      reranking: 30000,
      contextBuilding: 20000,
      generation: 180000,
      tools: 45000,
    },
  },
  agenticPresets: DEFAULT_PRESETS,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setTheme: (theme) => set({ theme }),
      setVectorStorePath: (vectorStorePath) =>
        set((state) => ({
          vectorStorePath,
          agenticConfig: { ...state.agenticConfig, vectorStorePath },
        })),
      setEmbeddingModel: (embeddingModel) =>
        set((state) => ({
          embeddingModel,
          agenticConfig: { ...state.agenticConfig, embeddingModel },
        })),
      setRerankingModel: (rerankingModel) =>
        set((state) => ({
          rerankingModel,
          agenticConfig: { ...state.agenticConfig, rerankingModel },
        })),
      updateChatSettings: (changes) =>
        set((state) => ({
          chatSettings: { ...state.chatSettings, ...changes },
        })),

      setAgenticConfig: (config) =>
        set((state) => ({
          agenticConfig: { ...state.agenticConfig, ...config },
          // Sync with top-level settings for backward compatibility
          vectorStorePath: config.vectorStorePath ?? state.vectorStorePath,
          embeddingModel: config.embeddingModel ?? state.embeddingModel,
          rerankingModel: config.rerankingModel ?? state.rerankingModel,
        })),

      // Tool management methods
      setToolsEnabled: (toolsEnabled: boolean) =>
        set((state) => ({
          agenticConfig: { ...state.agenticConfig, toolsEnabled },
        })),
      setWebSearchEnabled: (webSearchEnabled: boolean) =>
        set((state) => ({
          agenticConfig: { ...state.agenticConfig, webSearchEnabled },
        })),
      setWikipediaEnabled: (wikipediaEnabled: boolean) =>
        set((state) => ({
          agenticConfig: { ...state.agenticConfig, wikipediaEnabled },
        })),
      setNewsSearchEnabled: (newsSearchEnabled: boolean) =>
        set((state) => ({
          agenticConfig: { ...state.agenticConfig, newsSearchEnabled },
        })),
      updateToolConfig: (
        toolConfig: Partial<
          Pick<
            AgenticConfig,
            | "toolsEnabled"
            | "webSearchEnabled"
            | "wikipediaEnabled"
            | "newsSearchEnabled"
          >
        >
      ) =>
        set((state) => ({
          agenticConfig: { ...state.agenticConfig, ...toolConfig },
        })),

      resetToDefaults: () => set(DEFAULT_SETTINGS),
      validateAgenticSetup: () => {
        const state = get();
        const { agenticConfig } = state;
        const missingFields: string[] = [];
        const warnings: string[] = [];
        const recommendations: string[] = [];

        // Vector store path is now auto-defaulted, so we don't need to check for null
        // but we can warn if it's still not set somehow
        if (
          !agenticConfig.vectorStorePath ||
          agenticConfig.vectorStorePath.trim() === ""
        ) {
          missingFields.push("Vector Store Path");
          recommendations.push(
            "Vector store path should be automatically set to default"
          );
        }

        if (!agenticConfig.embeddingModel) {
          missingFields.push("Embedding Model");
          recommendations.push(
            "Choose an embedding model like 'nomic-embed-text'"
          );
        }

        if (!agenticConfig.rerankingModel) {
          warnings.push(
            "No reranking model selected - results may be less accurate"
          );
          recommendations.push(
            "Consider using 'llama3.2' for better result ranking"
          );
        }

        if (agenticConfig.maxRetrievalDocs > 10) {
          warnings.push("High document retrieval count may slow performance");
        }

        if (state.chatSettings.maxTokens < 256) {
          warnings.push("Low token limit may truncate responses");
          recommendations.push(
            "Consider increasing max tokens to 512 or higher"
          );
        }
        return {
          isValid: missingFields.length === 0,
          missingFields,
          warnings,
          recommendations,
        };
      },

      // Preset management functions
      savePreset: (name: string, description: string) => {
        const state = get();
        const newPreset: AgenticPreset = {
          id: crypto.randomUUID(),
          name,
          description,
          config: { ...state.agenticConfig },
          createdAt: Date.now(),
        };
        set((prevState) => ({
          agenticPresets: [...prevState.agenticPresets, newPreset],
        }));
      },
      loadPreset: (presetId: string) => {
        const state = get();
        const preset = state.agenticPresets.find((p) => p.id === presetId);
        if (preset) {
          set(() => ({
            agenticConfig: { ...preset.config },
            // Sync with top-level settings
            vectorStorePath: preset.config.vectorStorePath,
            embeddingModel: preset.config.embeddingModel,
            rerankingModel: preset.config.rerankingModel,
          }));
        }
      },

      deletePreset: (presetId: string) => {
        // Don't allow deletion of default presets
        if (DEFAULT_PRESETS.some((p) => p.id === presetId)) return;

        set((state) => ({
          agenticPresets: state.agenticPresets.filter((p) => p.id !== presetId),
        }));
      },

      exportPresets: () => {
        const state = get();
        const customPresets = state.agenticPresets.filter(
          (p) => !DEFAULT_PRESETS.some((dp) => dp.id === p.id)
        );
        return JSON.stringify(customPresets, null, 2);
      },

      importPresets: (presetsJson: string) => {
        try {
          const importedPresets: AgenticPreset[] = JSON.parse(presetsJson);

          // Validate preset structure
          const validPresets = importedPresets.filter(
            (preset) =>
              preset.id &&
              preset.name &&
              preset.config &&
              typeof preset.config === "object"
          );

          if (validPresets.length === 0) return false;

          set((state) => ({
            agenticPresets: [
              ...state.agenticPresets,
              ...validPresets.map((preset) => ({
                ...preset,
                id: crypto.randomUUID(), // Generate new IDs to avoid conflicts
                createdAt: Date.now(),
              })),
            ],
          }));

          return true;
        } catch {
          return false;
        }
      },
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
        agenticPresets: state.agenticPresets,
      }),
    }
  )
);
