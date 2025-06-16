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
import { useSettingsStore } from "@/stores/settings-store";
import type {
  ChatSettings,
  Message,
  PromptOptions,
  PipelineOutput,
} from "@/types";

export interface PipelineConfig extends ChatSettings {
  embeddingModel?: string | null;
  rerankingModel?: string | null;
  summaryLength?: number;
  promptOptions?: PromptOptions;
  historyLimit?: number;
  maxRetrievalDocs?: number;
  enableQueryRewriting?: boolean;
  enableResponseSummarization?: boolean;
  cachingEnabled?: boolean;
}

export interface PipelineMetrics {
  startTime: number;
  queryRewriteTime?: number;
  embeddingTime?: number;
  retrievalTime?: number;
  rerankingTime?: number;
  contextTime?: number;
  responseTime?: number;
  totalTime?: number;
  docsRetrieved: number;
  tokensEstimated: number;
}

export function createAgentPipeline(config?: Partial<PipelineConfig>) {
  // Get settings from store and merge with provided config
  const settings = useSettingsStore.getState();
  const agenticConfig = settings.agenticConfig;
  
  // Validate setup
  const validation = settings.validateAgenticSetup();
  if (!validation.isValid) {
    console.warn("Agentic setup incomplete:", validation.missingFields);
  }
  
  const finalConfig: PipelineConfig = {
    ...settings.chatSettings,
    embeddingModel: config?.embeddingModel ?? agenticConfig.embeddingModel,
    rerankingModel: config?.rerankingModel ?? agenticConfig.rerankingModel,
    summaryLength: config?.summaryLength ?? agenticConfig.contextSummaryLength,
    historyLimit: config?.historyLimit ?? agenticConfig.historyLimit,
    maxRetrievalDocs: config?.maxRetrievalDocs ?? agenticConfig.maxRetrievalDocs,
    enableQueryRewriting: config?.enableQueryRewriting ?? agenticConfig.enableQueryRewriting,
    enableResponseSummarization: config?.enableResponseSummarization ?? agenticConfig.enableResponseSummarization,
    cachingEnabled: config?.cachingEnabled ?? agenticConfig.cachingEnabled,
    promptOptions: config?.promptOptions,
    ...config,
  };

  const retriever = new VectorStoreRetriever();
  const embedder = new QueryEmbedder(finalConfig.embeddingModel);
  const reranker = new Reranker(finalConfig.rerankingModel);
  const rag = new RagAssembler();
  const trimmer = new HistoryTrimmer(finalConfig.historyLimit);
  const promptBuilder = new PromptBuilder(finalConfig.promptOptions);
  const contextSummarizer = new ContextSummarizer(finalConfig.summaryLength);
  const responseSummarizer = new ResponseSummarizer();
  const rewriter = new QueryRewriter();
  const chat = new OllamaChat(finalConfig);
  const logger = new ResponseLogger();
  const tools: Runnable[] = [];

  return {
    use(step: Runnable<unknown, unknown>) {
      tools.push(step);
      return this;
    },

    async *run(messages: Message[], signal?: AbortSignal): AsyncGenerator<PipelineOutput> {
      const metrics: PipelineMetrics = {
        startTime: Date.now(),
        docsRetrieved: 0,
        tokensEstimated: 0,
      };

      const aborted = () => signal?.aborted;
      let query = messages[messages.length - 1]?.content ?? "";
      
      if (!query.trim()) {
        yield { type: "error", message: "Query is empty" } as const;
        return;
      }

      try {
        // Query Rewriting Phase
        if (finalConfig.enableQueryRewriting) {
          yield { type: "status", message: "Rewriting query for better results" } as const;
          if (aborted()) return;
          
          const rewriteStart = Date.now();
          query = rewriter.rewrite(query);
          metrics.queryRewriteTime = Date.now() - rewriteStart;
          
          if (!query.trim()) {
            yield { type: "error", message: "Query rewriting failed" } as const;
            return;
          }
        }

        // Embedding Phase
        yield { type: "status", message: "Embedding query" } as const;
        if (aborted()) return;
        
        const embeddingStart = Date.now();
        try {
          await embedder.embed(query);
          metrics.embeddingTime = Date.now() - embeddingStart;
        } catch (error) {
          console.error("Embedding failed:", error);
          yield { type: "error", message: "Failed to generate query embedding" } as const;
          return;
        }

        // Document Retrieval Phase
        yield { type: "status", message: "Retrieving relevant documents" } as const;
        if (aborted()) return;
        
        const retrievalStart = Date.now();
        let docs;
        try {
          docs = await retriever.getRelevantDocuments(query);
          metrics.retrievalTime = Date.now() - retrievalStart;
          metrics.docsRetrieved = docs.length;
            // Limit docs based on configuration
          if (docs.length > (finalConfig.maxRetrievalDocs || 5)) {
            docs = docs.slice(0, finalConfig.maxRetrievalDocs || 5);
            yield { type: "status", message: `Limited to ${finalConfig.maxRetrievalDocs || 5} most relevant documents` } as const;
          }
          
          yield { type: "docs", docs } as const;
        } catch (error) {
          console.error("Document retrieval failed:", error);
          yield { type: "error", message: "Failed to retrieve documents from knowledge base" } as const;
          return;
        }

        // Reranking Phase
        if (finalConfig.rerankingModel && docs.length > 1) {
          yield { type: "status", message: "Reranking results for relevance" } as const;
          if (aborted()) return;
          
          const rerankingStart = Date.now();
          try {
            docs = await reranker.rerank(docs);
            metrics.rerankingTime = Date.now() - rerankingStart;
          } catch (error) {
            console.error("Reranking failed:", error);
            yield { type: "status", message: "Reranking failed, using original order" } as const;
          }
        }

        // Context Building Phase
        const trimmed = trimmer.trim(messages);
        if (aborted()) return;
        
        const contextStart = Date.now();
        yield { type: "status", message: "Building context from documents" } as const;
        if (aborted()) return;
        
        let summarized;
        try {
          summarized = await contextSummarizer.summarize(docs);
          metrics.contextTime = Date.now() - contextStart;
        } catch (error) {
          console.error("Context summarization failed:", error);
          yield { type: "error", message: "Failed to process document context" } as const;
          return;
        }

        if (aborted()) return;
        yield { type: "status", message: "Assembling final prompt" } as const;
        if (aborted()) return;
        
        const assembled = rag.assemble(trimmed, summarized);
        const prompt = promptBuilder.build(assembled);

        const tokenEstimate = prompt.split(/\s+/).filter(Boolean).length;
        metrics.tokensEstimated = tokenEstimate;
        
        const thinking = `docs: ${summarized.length}, tokens: ${tokenEstimate}, retrieval: ${metrics.retrievalTime}ms`;
        yield { type: "thinking", message: thinking } as const;
        yield { type: "tokens", count: tokenEstimate } as const;

        // Tools Phase
        for (const tool of tools) {
          if (aborted()) return;
          try {
            const output = await tool.invoke(prompt);
            yield { type: "tool", name: tool.name || "tool", output } as const;
          } catch (error) {
            console.error("Tool failed:", error);
            yield { type: "error", message: `Tool ${tool.name || "unknown"} failed: ${error instanceof Error ? error.message : "Unknown error"}` } as const;
          }
        }

        // Model Invocation Phase
        if (aborted()) return;
        yield { type: "status", message: "Generating response" } as const;
        if (aborted()) return;
        
        const responseStart = Date.now();
        let full = "";
        try {
          const chatModel = finalConfig.model || "llama3.2";
          for await (const chunk of chat.invoke({ 
            model: chatModel, 
            messages: [{ role: "user", content: prompt }] 
          })) {
            if (aborted()) return;
            full += chunk.message;
            yield { type: "chat", chunk } as const;
          }
          metrics.responseTime = Date.now() - responseStart;
        } catch (error) {
          console.error("Chat invocation failed:", error);
          yield { type: "error", message: `Model invocation failed: ${error instanceof Error ? error.message : "Unknown error"}` } as const;
          return;
        }

        // Response Summarization Phase
        if (finalConfig.enableResponseSummarization && full.length > 1000) {
          try {
            const summary = responseSummarizer.summarize(full);
            yield { type: "summary", message: summary } as const;
          } catch (error) {
            console.error("Response summarization failed:", error);
          }
        }

        // Calculate total time
        metrics.totalTime = Date.now() - metrics.startTime;
        yield { type: "status", message: `Completed in ${metrics.totalTime}ms` } as const;

        // Performance metrics
        yield { 
          type: "metrics", 
          data: {
            ...metrics,
            efficiency: metrics.docsRetrieved > 0 ? metrics.totalTime / metrics.docsRetrieved : 0,
            tokensPerSecond: metrics.responseTime ? (metrics.tokensEstimated / (metrics.responseTime / 1000)) : 0
          }
        } as const;

        // Save conversation to vector store
        if (finalConfig.cachingEnabled) {
          try {
            const docsToSave = docs.map((d) => ({ 
              id: crypto.randomUUID(), 
              text: d.text,
              metadata: { timestamp: Date.now(), query }
            }));
            await vectorStore.addConversation(
              messages[0]?.id ?? crypto.randomUUID(), 
              docsToSave
            );
          } catch (err) {
            console.error("Conversation save failed:", err);
            yield { type: "status", message: "Failed to save conversation to knowledge base" } as const;
          }
        }        // Log the interaction
        try {
          await logger.log([
            ...messages, 
            { 
              id: crypto.randomUUID(), 
              role: "assistant", 
              content: full
            }
          ]);
          
          // Log metrics separately for debugging
          console.log("Pipeline metrics:", { metrics, agenticConfig: finalConfig });
        } catch (err) {
          console.error("Response logging failed:", err);
        }

      } catch (error) {
        console.error("Pipeline error:", error);
        yield { 
          type: "error", 
          message: `Pipeline failed: ${error instanceof Error ? error.message : "Unknown error"}` 
        } as const;
      }
    },
  };
}
