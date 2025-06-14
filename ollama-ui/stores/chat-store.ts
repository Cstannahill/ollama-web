import { create } from "zustand";
import type { Message } from "@/types";
import { OllamaClient } from "@/lib/ollama/client";
import { vectorStore } from "@/lib/vector";
import { createAgentPipeline } from "@/services/agent-pipeline";
import { useSettingsStore } from "./settings-store";

type ChatMode = "simple" | "agentic";

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  status: string | null;
  abortController: AbortController | null;
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  sendMessage: (text: string) => Promise<void>;
  stop: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  status: null,
  abortController: null,
  mode: "simple",
  setMode: (mode) => set({ mode }),
  async sendMessage(text: string) {
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const current = get().messages;
    const controller = new AbortController();
    set({
      messages: [...current, userMsg],
      isStreaming: true,
      status: null,
      abortController: controller,
    });

    const {
      vectorStorePath,
      embeddingModel,
      rerankingModel,
      chatSettings,
    } = useSettingsStore.getState();

    if (get().mode === "agentic" && vectorStorePath) {
      if (!(vectorStore as any).collection) {
        await vectorStore.initialize({ storagePath: vectorStorePath });
      }
      const pipeline = createAgentPipeline({
        ...chatSettings,
        embeddingModel,
        rerankingModel,
      });
      let assistant: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
      set((state) => ({ messages: [...state.messages, assistant] }));
      try {
        for await (const out of pipeline.run([...current, userMsg], controller.signal)) {
          if (out.type === "status") {
            set({ status: out.message });
            if (controller.signal.aborted) return;
            continue;
          }
          assistant = { ...assistant, content: assistant.content + out.chunk.message };
          set((state) => {
            const msgs = [...state.messages];
            msgs[msgs.length - 1] = assistant;
            return { messages: msgs };
          });
          if (controller.signal.aborted) return;
        }
      } catch (error) {
        console.error("Pipeline run failed", error);
        set({ status: "Unexpected error" });
      }
      set({ isStreaming: false, status: null, abortController: null });
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
    set({ isStreaming: false, status: null, abortController: null });
  },
  stop() {
    get().abortController?.abort();
    set({ isStreaming: false, status: null, abortController: null });
  },
}));

