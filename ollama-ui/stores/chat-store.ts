import { create } from "zustand";
import type { Message, SearchResult } from "@/types";
import { OllamaClient } from "@/lib/ollama/client";
import { vectorStore } from "@/lib/vector";
import { createAgentPipeline } from "@/services/agent-pipeline";
import { useSettingsStore } from "./settings-store";

type ChatMode = "simple" | "agentic";

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  status: string | null;
  thinking: string | null;
  summary: string | null;
  error: string | null;
  tokens: number | null;
  docs: SearchResult[];
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  sendMessage: (text: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  status: null,
  thinking: null,
  summary: null,
  error: null,
  tokens: null,
  mode: "simple",
  setMode: (mode) => set({ mode }),
  async sendMessage(text: string) {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const current = get().messages;
    set({ messages: [...current, userMsg], isStreaming: true, status: null, summary: null, error: null });

    const {
      vectorStorePath,
      embeddingModel,
      rerankingModel,
      chatSettings,
    } = useSettingsStore.getState();

    if (get().mode === "agentic" && vectorStorePath) {
      if (!(vectorStore as any).collection) {
        try {
          await vectorStore.initialize({ storagePath: vectorStorePath });
        } catch (error) {
          console.error("Vector store init failed", error);
          set({ isStreaming: false, status: "Vector DB init failed", thinking: null, tokens: null });
          return;
        }
      }
      const pipeline = createAgentPipeline({
        ...chatSettings,
        embeddingModel,
        rerankingModel,
      });
      let assistant: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
      set((state) => ({ messages: [...state.messages, assistant], summary: null, error: null }));
      for await (const out of pipeline.run([...current, userMsg])) {
        if (out.type === "status") {
          set({ status: out.message });
          continue;
        }
        if (out.type === "docs") {
          set({ docs: out.docs });
          continue;
        }
        if (out.type === "thinking") {
          set({ thinking: out.message });
          continue;
        }
        if (out.type === "error") {
          set({ error: out.message });
          continue;
        }
        if (out.type === "summary") {
          set({ summary: out.message });

        if (out.type === "tokens") {
          set({ tokens: out.count });

          continue;
        }
        assistant = { ...assistant, content: assistant.content + out.chunk.message };
        set((state) => {
          const msgs = [...state.messages];
          msgs[msgs.length - 1] = assistant;
          return { messages: msgs };
        });
      }
      set({ isStreaming: false, status: null, thinking: null, tokens: null, docs: [] });
      return;
    }

    const client = new OllamaClient({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });
    let assistant: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
    set((state) => ({ messages: [...state.messages, assistant] }));
    for await (const chunk of client.chat({
      model: "llama3",
      messages: [...current, userMsg],
    })) {
      assistant = { ...assistant, content: assistant.content + chunk.message };
      set((state) => {
        const msgs = [...state.messages];
        msgs[msgs.length - 1] = assistant;
        return { messages: msgs };
      });
    }
    set({ isStreaming: false, status: null, thinking: null, tokens: null, docs: [] });
  },
}));

