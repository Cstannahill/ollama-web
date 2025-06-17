import { create } from "zustand";
import type { Message, SearchResult } from "@/types";
import type { ProcessingMetricsData } from "@/types/langchain/PipelineOutput";
import { OllamaClient } from "@/lib/ollama/client";
import { vectorStore } from "@/lib/vector";
import { createAgentPipeline } from "@/services/agent-pipeline";
import { conversationEmbedding } from "@/services/conversation-embedding";
import { useSettingsStore } from "./settings-store";
import { useConversationStore } from "./conversation-store";
import { AI_COMPONENT_INSTRUCTIONS_ARRAY } from "@/lib/markdown-prompts";
import { OLLAMA_BASE_URL } from "@/lib/config";

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
  tools: { name: string; output: string }[];
  metrics: ProcessingMetricsData | null; // Pipeline metrics
  multiTurnSummary: {
    summary: string;
    metrics: {
      entityOverlap: number;
      topicContinuity: number;
      contextualRelevance: number;
    };
  } | null; // Multi-turn retrieval summary
  abortController: AbortController | null;

  // Failure tracking for smart fallback
  consecutiveFailures: number;
  lastFailureTime: number | null;

  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  setError: (msg: string | null) => void;
  sendMessage: (text: string) => Promise<void>;
  stop: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isStreaming: false,
  status: null,

  thinking: null,
  summary: null,
  error: null,
  tokens: null,
  docs: [],
  tools: [],
  metrics: null,
  multiTurnSummary: null,
  abortController: null,

  // Failure tracking
  consecutiveFailures: 0,
  lastFailureTime: null,

  mode: "simple",
  setMode: (mode) => set({ mode }),
  setError: (msg) => set({ error: msg }),
  async sendMessage(text: string) {
    // Get active conversation or create one if none exists
    const {
      activeConversationId,
      createConversation,
      addMessageToConversation,
    } = useConversationStore.getState();

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = createConversation(get().mode);
    }

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    const current = get().messages;
    set({
      messages: [...current, userMsg],
      isStreaming: true,
      status: null,
      summary: null,
      error: null,
      tokens: null,
      docs: [],
      tools: [],
      metrics: null,
      multiTurnSummary: null,
    });

    // Save user message to conversation
    addMessageToConversation(conversationId, userMsg);

    const controller = new AbortController();
    set({
      messages: [...current, userMsg],
      isStreaming: true,
      status: null,
      abortController: controller,
    });
    const { vectorStorePath, embeddingModel, rerankingModel, chatSettings } =
      useSettingsStore.getState();

    // Smart fallback logic
    const MAX_CONSECUTIVE_FAILURES = 3;
    const FAILURE_RESET_TIME = 5 * 60 * 1000; // 5 minutes

    const shouldFallbackToSimple = () => {
      const state = get();
      const now = Date.now();

      // Reset failure count if enough time has passed
      if (
        state.lastFailureTime &&
        now - state.lastFailureTime > FAILURE_RESET_TIME
      ) {
        set({ consecutiveFailures: 0, lastFailureTime: null });
        return false;
      }

      return state.consecutiveFailures >= MAX_CONSECUTIVE_FAILURES;
    };

    const recordFailure = () => {
      const state = get();
      set({
        consecutiveFailures: state.consecutiveFailures + 1,
        lastFailureTime: Date.now(),
      });
    };

    const recordSuccess = () => {
      set({ consecutiveFailures: 0, lastFailureTime: null });
    };

    if (get().mode === "agentic" && vectorStorePath) {
      // Check if we should fallback due to repeated failures
      if (shouldFallbackToSimple()) {
        set({
          mode: "simple",
          error:
            "Switched to simple mode due to repeated agentic failures. You can switch back manually in settings.",
        });
        // Continue with simple mode processing below      } else {
        // Check if vector store needs initialization
        if (!vectorStore.getStats().initialized) {
          try {
            await vectorStore.initialize({ storagePath: vectorStorePath });
          } catch (error) {
            console.error("Vector store init failed", error);
            recordFailure(); // Record initialization failure
            set({
              isStreaming: false,
              status: "Vector DB init failed",
              thinking: null,
              tokens: null,
              docs: [],
              tools: [],
            });
            return;
          }
        }
        const pipeline = createAgentPipeline({
          ...chatSettings,
          embeddingModel,
          rerankingModel,
          promptOptions: { instructions: AI_COMPONENT_INSTRUCTIONS_ARRAY },
        });
        let assistant: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "",
        };
        set((state) => ({
          messages: [...state.messages, assistant],
          summary: null,
          error: null,
          multiTurnSummary: null,
        }));
        try {
          for await (const out of pipeline.run(
            [...current, userMsg],
            controller.signal
          )) {
            if (out.type === "status") {
              set({ status: out.message });
              if (controller.signal.aborted) return;
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
              recordFailure(); // Record pipeline-level errors
              set({ error: out.message });
              continue;
            }
            if (out.type === "summary") {
              set({ summary: out.message });
              continue;
            }
            if (out.type === "tokens") {
              set({ tokens: out.count });
              continue;
            }
            if (out.type === "tool") {
              set((state) => ({
                tools: [...state.tools, { name: out.name, output: out.output }],
              }));
              continue;
            }
            if (out.type === "metrics") {
              set({ metrics: out.data });
              continue;
            }
            if (out.type === "multi-turn-summary") {
              set({
                multiTurnSummary: {
                  summary: out.summary,
                  metrics: out.metrics,
                },
              });
              continue;
            }
            // Fix: Add proper type checking for chat messages
            if (out.type === "chat" && out.chunk && out.chunk.message) {
              assistant = {
                ...assistant,
                content: assistant.content + out.chunk.message,
              };
              set((state) => {
                const msgs = [...state.messages];
                msgs[msgs.length - 1] = assistant;
                return { messages: msgs };
              });
            }
            if (controller.signal.aborted) return;
          }
          // Record success if we made it through without errors
          recordSuccess();
        } catch (error) {
          console.error("Pipeline run failed", error);
          recordFailure(); // Record the failure
          set({ status: "Unexpected error", error: "Pipeline failed" });
        }
        set({
          isStreaming: false,
          status: null,
          thinking: null,
          tokens: null,
          docs: [],
          tools: [],
          metrics: null,
          multiTurnSummary: null,
          abortController: null,
        });
        set((state) => ({ messages: [...state.messages, assistant] })); // Save assistant message to conversation
        addMessageToConversation(conversationId, assistant);

        // Automatically embed this conversation exchange into vector store
        try {
          await conversationEmbedding.addConversationExchange(
            conversationId,
            userMsg,
            assistant,
            "agentic",
            get().docs.length
          );
        } catch (error) {
          console.warn("Failed to embed conversation exchange:", error);
        }

        return;
      } // End of agentic processing block
    }
    const client = new OllamaClient({
      baseUrl: OLLAMA_BASE_URL,
    });
    let assistant: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "",
    };
    set((state) => ({ messages: [...state.messages, assistant] }));
    try {
      const modelToUse = chatSettings.model || "mistral:latest";
      for await (const chunk of client.chat({
        model: modelToUse,
        messages: [...current, userMsg],
      })) {
        assistant = {
          ...assistant,
          content: assistant.content + chunk.message,
        };
        set((state) => {
          const msgs = [...state.messages];
          msgs[msgs.length - 1] = assistant;
          return { messages: msgs };
        });
      }
    } catch (error) {
      console.error("Chat request failed", error);
      set({ error: "Chat request failed" });
    }
    set({
      isStreaming: false,
      status: null,
      thinking: null,
      tokens: null,
      docs: [],
      tools: [],
      metrics: null,
      multiTurnSummary: null,
      abortController: null,
    }); // Save assistant message to conversation
    addMessageToConversation(conversationId, assistant);

    // Automatically embed this conversation exchange into vector store
    try {
      await conversationEmbedding.addConversationExchange(
        conversationId,
        userMsg,
        assistant,
        "simple"
      );
    } catch (error) {
      console.warn("Failed to embed conversation exchange:", error);
    }
  },
  stop() {
    get().abortController?.abort();
    set({
      isStreaming: false,
      status: null,
      abortController: null,
      error: null,
      multiTurnSummary: null,
    });
  },
}));
