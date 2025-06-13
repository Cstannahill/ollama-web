import { create } from "zustand";
import type { ChatMessage, Message } from "@/types";
import { OllamaClient } from "@/lib/ollama/client";
import { vectorStore } from "@/lib/vector";
import { useSettingsStore } from "./settings-store";

type ChatMode = "simple" | "agentic";

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  sendMessage: (text: string) => Promise<void>;
}


export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  mode: "simple",
  setMode: (mode) => set({ mode }),
  async sendMessage(text: string) {
    const client = new OllamaClient({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });
    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const current = get().messages;
    set({ messages: [...current, userMsg], isStreaming: true });

    let context: ChatMessage[] = [];
    const { vectorStorePath } = useSettingsStore.getState();
    if (get().mode === "agentic" && vectorStorePath) {
      if (!(vectorStore as any).collection) {
        await vectorStore.initialize({ storagePath: vectorStorePath });
      }
      const results = await vectorStore.search(text);
      context = results.map((r) => ({ role: "system", content: r.text }));
    }

    let assistant: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
    set((state) => ({ messages: [...state.messages, assistant] }));

    for await (const chunk of client.chat({
      model: "llama3",
      messages: [...current, userMsg, ...context],
    })) {
      assistant = { ...assistant, content: assistant.content + chunk.message };
      set((state) => {
        const msgs = [...state.messages];
        msgs[msgs.length - 1] = assistant;
        return { messages: msgs };
      });
    }

    set({ isStreaming: false });
  },
}));
