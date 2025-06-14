import { Runnable } from "@langchain/core/runnables";
import { VectorStoreRetriever } from "@/lib/langchain/vector-retriever";
import { QueryEmbedder } from "@/lib/langchain/query-embedder";
import { Reranker } from "@/lib/langchain/reranker";
import { RagAssembler } from "@/lib/langchain/rag-assembler";
import { PromptBuilder } from "@/lib/langchain/prompt-builder";
import { ContextSummarizer } from "@/lib/langchain/context-summarizer";
import { ResponseSummarizer } from "@/lib/langchain/response-summarizer";
import { HistoryTrimmer } from "@/lib/langchain/history-trimmer";
import { ResponseLogger } from "@/lib/langchain/response-logger";
import { QueryRewriter } from "@/lib/langchain/query-rewriter";
import { OllamaChat } from "@/lib/langchain/ollama-chat";
import { vectorStore } from "@/lib/vector";
import type { ChatSettings, Message, PromptOptions } from "@/types";
import type { PipelineOutput } from "@/types";
import type { Message } from "@/types";
import type { PipelineOutput } from "@/types";
import type { ChatSettings, PromptOptions } from "@/types";

export interface PipelineConfig extends ChatSettings {
  embeddingModel?: string | null;
  rerankingModel?: string | null;
  summaryLength?: number;
  promptOptions?: PromptOptions;
  historyLimit?: number;
}

export function createAgentPipeline(config: PipelineConfig) {
  const {
    embeddingModel,
    rerankingModel,
    promptOptions,
    summaryLength = 200,
    historyLimit = 10,
    ...chatSettings
  } = config;

  const retriever = new VectorStoreRetriever();
  const embedder = new QueryEmbedder(embeddingModel);
  const reranker = new Reranker(rerankingModel);
  const rag = new RagAssembler();
  const trimmer = new HistoryTrimmer(historyLimit);
  const promptBuilder = new PromptBuilder(promptOptions);
  const contextSummarizer = new ContextSummarizer(summaryLength);
  const responseSummarizer = new ResponseSummarizer();
  const rewriter = new QueryRewriter();
  const chat = new OllamaChat(chatSettings);
  const logger = new ResponseLogger();

  const tools: Runnable[] = [];

  return {
    use(step: Runnable<unknown, unknown>) {
      tools.push(step);
      return this;
    },

    async *run(messages: Message[], signal?: AbortSignal): AsyncGenerator<PipelineOutput> {
      const aborted = () => signal?.aborted;
      let query = messages[messages.length - 1]?.content ?? "";
      query = rewriter.rewrite(query);
      if (!query.trim()) {
        yield { type: "status", message: "Query empty" } as const;
        return;
      }

      yield { type: "status", message: "Embedding query" } as const;
      if (aborted()) return;
      await embedder.embed(query);

      yield { type: "status", message: "Retrieving documents" } as const;
      if (aborted()) return;
      let docs = await retriever.getRelevantDocuments(query);
      yield { type: "docs", docs } as const;

      if (aborted()) return;
      yield { type: "status", message: "Reranking results" } as const;
      if (aborted()) return;
      docs = await reranker.rerank(docs);

      const trimmed = trimmer.trim(messages);
      if (aborted()) return;
      yield { type: "status", message: "Summarizing context" } as const;
      if (aborted()) return;
      const summarized = await contextSummarizer.summarize(docs);

      if (aborted()) return;
      yield { type: "status", message: "Building prompt" } as const;
      if (aborted()) return;
      const assembled = rag.assemble(trimmed, summarized);
      const prompt = promptBuilder.build(assembled);

      const tokenEstimate = prompt.split(/\s+/).filter(Boolean).length;
      const thinking = `docs: ${summarized.length}, tokens: ${tokenEstimate}`;
      yield { type: "thinking", message: thinking } as const;
      yield { type: "tokens", count: tokenEstimate } as const;

      for (const tool of tools) {
        if (aborted()) return;
        try {
          const output = await tool.invoke(prompt);
          yield { type: "tool", name: tool.name || "tool", output } as const;
        } catch (error) {
          console.error("Tool failed", error);
          yield { type: "error", message: `${tool.name || "tool"} failed` } as const;
        }
      }

      if (aborted()) return;
      yield { type: "status", message: "Invoking model" } as const;
      if (aborted()) return;
      let full = "";
      try {
        for await (const chunk of chat.invoke({ model: "llama3", messages: [{ role: "user", content: prompt }] })) {
          if (aborted()) return;
          full += chunk.message;
          yield { type: "chat", chunk } as const;
        }
      } catch (error) {
        console.error("Chat invocation failed", error);
        yield { type: "error", message: "Model invocation failed" } as const;
        return;
      }

      const summary = responseSummarizer.summarize(full);
      yield { type: "summary", message: summary } as const;
      yield { type: "status", message: "Completed" } as const;

      try {
        const docsToSave = docs.map((d) => ({ id: crypto.randomUUID(), text: d.text }));
        await vectorStore.addConversation(messages[0]?.id ?? crypto.randomUUID(), docsToSave);
      } catch (err) {
        console.error("Conversation save failed", err);
        yield { type: "status", message: "Failed to save conversation" } as const;
      }

      try {
        await logger.log([...messages, { id: crypto.randomUUID(), role: "assistant", content: full }]);
      } catch (err) {
        console.error("Logger failed", err);
      }
export function createAgentPipeline(_config: PipelineConfig) {
  void _config;
  return {
    use() {
      return this;
    },
    async *run(_messages: Message[]): AsyncGenerator<PipelineOutput> {
      void _messages;
      yield { type: "status", message: "Pipeline not implemented" } as const;
    },
  };
}
