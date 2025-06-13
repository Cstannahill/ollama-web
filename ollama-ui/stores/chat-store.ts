import { create } from "zustand";
import type { ChatMessage } from "@/types";
import { OllamaClient } from "@/lib/ollama/client";

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  sendMessage: (text: string) => Promise<void>;
}


export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  async sendMessage(text: string) {
    const client = new OllamaClient({
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
    });
    const userMsg: ChatMessage = { role: "user", content: text };
    const current = get().messages;
    set({ messages: [...current, userMsg], isStreaming: true });

    let assistant: ChatMessage = { role: "assistant", content: "" };
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

    set({ isStreaming: false });
  },
}));
