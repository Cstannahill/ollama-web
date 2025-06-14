import { Runnable } from "@langchain/core/runnables";
import { VectorStoreRetriever } from "@/lib/langchain/vector-retriever";
import { PromptBuilder } from "@/lib/langchain/prompt-builder";
import { OllamaChat } from "@/lib/langchain/ollama-chat";
import { vectorStore } from "@/lib/vector";
import type {
  ChatSettings,
  Message,
  SearchResult,
  PromptOptions,
} from "@/types";
import type { PipelineOutput } from "@/types";
import { QueryEmbedder } from "@/lib/langchain/query-embedder";
import { Reranker } from "@/lib/langchain/reranker";
import { RagAssembler } from "@/lib/langchain/rag-assembler";
import { ResponseSummarizer } from "@/lib/langchain/response-summarizer";
import { HistoryTrimmer } from "@/lib/langchain/history-trimmer";
import { ContextSummarizer } from "@/lib/langchain/context-summarizer";
import { ResponseLogger } from "@/lib/langchain/response-logger";


export interface PipelineConfig extends ChatSettings {
  embeddingModel?: string | null;
  rerankingModel?: string | null;
  summaryLength?: number;
  promptOptions?: PromptOptions;
  historyLimit?: number;
}
export function createAgentPipeline(config: PipelineConfig) {
  const { embeddingModel, rerankingModel, promptOptions, summaryLength, historyLimit, ...chatSettings } = config;

  const retriever = new VectorStoreRetriever();
  const embedder = new QueryEmbedder(embeddingModel);
  const reranker = new Reranker(rerankingModel);
  const rag = new RagAssembler();
  const trimmer = new HistoryTrimmer(historyLimit);
  const promptBuilder = new PromptBuilder(promptOptions);
  const summarizer = new ContextSummarizer(summaryLength);
  const chat = new OllamaChat(chatSettings);
  const summarizer = new ResponseSummarizer();
  const logger = new ResponseLogger();



  const tools: Runnable[] = [];

  const pipeline = {
    use(step: Runnable<unknown, unknown>) {
      tools.push(step);
      return this;
    },

    async *run(messages: Message[], signal?: AbortSignal): AsyncGenerator<PipelineOutput> {
      const isAborted = () => signal?.aborted;
      const query = messages[messages.length - 1]?.content ?? "";
      if (!query.trim()) {
        yield { type: "status", message: "Query empty" } as const;
        return;
      }
      yield { type: "status", message: "Embedding query" } as const;
      if (isAborted()) return;
      try {
        await embedder.embed(query);
      } catch (error) {
        console.error("Embedder failed", error);
        yield { type: "status", message: "Embedding failed" } as const;
      }

      if (isAborted()) return;
      
      yield { type: "status", message: "Retrieving documents" } as const;
      if (isAborted()) return;
      let docs: SearchResult[] = [];
      try {
        docs = await retriever.getRelevantDocuments(query);
      } catch (error) {
        console.error("Retrieval failed", error);


        yield { type: "error", message: "Retrieval failed" } as const;

        if (
          error instanceof Error &&
          error.message.includes("not initialized")
        ) {
          yield { type: "status", message: "Vector store not ready" } as const;
          return;
        }
        yield { type: "status", message: "Retrieval failed" } as const;

        yield { type: "status", message: "Retrieval failed, retrying" } as const;
        if (!isAborted()) {
          try {
            docs = await retriever.getRelevantDocuments(query);
          } catch (err) {
            console.error("Retrieval retry failed", err);
            yield { type: "status", message: "Retrieval failed" } as const;
          }
        }
      }
      yield { type: "docs", docs } as const;

      if (isAborted()) return;

      yield { type: "status", message: "Reranking results" } as const;
      if (isAborted()) return;
      let ranked = docs;
      try {
        ranked = await reranker.rerank(docs);
      } catch (error) {
        console.error("Reranking failed", error);
      }


      let assembled: Message[] = [];
      try {
        assembled = rag.assemble(trimmed, ranked);
      } catch (error) {
        console.error("RAG assembly failed", error);
        yield { type: "status", message: "RAG assembly failed" } as const;
      }
      let prompt = "";
      try {

      if (isAborted()) return;
      yield { type: "status", message: "Summarizing context" } as const;
      if (isAborted()) return;
      let summarized = ranked;
      try {
        summarized = await summarizer.summarize(ranked);
      } catch (error) {
        console.error("Summarization failed", error);
        yield { type: "status", message: "Summarization failed" } as const;
      }

      if (isAborted()) return;
      yield { type: "status", message: "Building prompt" } as const;
      if (isAborted()) return;
      let prompt = "";
      try {
        const assembled = rag.assemble(messages, summarized);
        prompt = promptBuilder.build(assembled);
      } catch (error) {
        console.error("Prompt build failed", error);
        yield { type: "status", message: "Prompt build failed" } as const;
      }

      const thinking = `docs: ${ranked.length}, prompt preview: ${prompt.slice(0, 40)}...`;
      yield { type: "thinking", message: thinking } as const;
      const tokenEstimate = prompt.split(/\s+/).filter(Boolean).length;
      yield { type: "tokens", count: tokenEstimate } as const;

        return;
      }

      for (const tool of tools) {
        try {
          const output = await tool.invoke(prompt);
          yield { type: "tool", name: tool.name || "tool", output } as const;
        } catch (error) {
          console.error("Tool failed", error);
          yield { type: "error", message: `${tool.name || "tool"} failed` } as const;
        }
      }

      if (isAborted()) return;

      yield { type: "status", message: "Invoking model" } as const;
      if (isAborted()) return;
      try {
        let full = "";
        for await (const chunk of chat.invoke({ model: "llama3", messages: [{ role: "user", content: prompt }] })) {

          if (isAborted()) return;

          full += chunk.message;
          yield { type: "chat", chunk } as const;
        }
        try {
          const summary = summarizer.summarize(full);
          yield { type: "summary", message: summary } as const;
        } catch (error) {
          console.error("Summarization failed", error);
          yield { type: "error", message: "Summarization failed" } as const;
        }
        yield { type: "status", message: "Completed" } as const;
        try {

          const docsToSave = ranked.map((d) => ({
            id: crypto.randomUUID(),
            text: d.text,
          }));
          await vectorStore.addConversation(messages[0]?.id ?? crypto.randomUUID(), docsToSave);
        } catch (error) {
          console.error("Conversation save failed", error);
          yield { type: "status", message: "Failed to save conversation" } as const;

          await logger.log([...messages, { id: crypto.randomUUID(), role: "assistant", content: full }]);
        } catch (err) {
          console.error("Logger failed", err);

        }
      } catch (error) {
        console.error("Chat invocation failed", error);
        yield { type: "error", message: "Model invocation failed" } as const;
      }
    },
  };

  return pipeline;
}
