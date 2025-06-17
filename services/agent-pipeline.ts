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
import { ToolRegistry, type ToolRegistryConfig } from "@/lib/langchain/tools";
import { vectorStore } from "@/lib/vector";
import { useSettingsStore } from "@/stores/settings-store";
import { useConversationStore } from "@/stores/conversation-store";
import { stepCache } from "@/services/step-cache";
import { MultiTurnRetrievalService } from "@/services/multi-turn-retrieval";
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
  toolsEnabled?: boolean;
  toolConfig?: ToolRegistryConfig;
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
  toolsUsed?: number;
  toolExecutionTime?: number;
  performanceWarnings?: PerformanceWarning[];
  errors?: Array<{
    step: string;
    error: string;
    timestamp: number;
    isRecoverable: boolean;
  }>;
  cacheHits?: number;
  cacheAttempts?: number;
}

// Default timeout configurations (in milliseconds)
const DEFAULT_STEP_TIMEOUTS = {
  queryRewrite: 30000, // 30 seconds
  embedding: 45000, // 45 seconds
  retrieval: 60000, // 60 seconds
  reranking: 30000, // 30 seconds
  contextBuilding: 20000, // 20 seconds
  generation: 180000, // 3 minutes
  tools: 45000, // 45 seconds for tool execution
};

// Performance monitoring thresholds
const PERFORMANCE_THRESHOLDS = {
  queryRewrite: 5000, // Warn if > 5s
  embedding: 10000, // Warn if > 10s
  retrieval: 15000, // Warn if > 15s
  reranking: 8000, // Warn if > 8s
  contextBuilding: 5000, // Warn if > 5s
  generation: 30000, // Warn if > 30s
  tools: 15000, // Warn if > 15s
};

// Enhanced timeout utility with better error context and fallback options
interface TimeoutError extends Error {
  isTimeout: true;
  stepName: string;
  timeoutMs: number;
  suggestion?: string;
  isPerformanceIssue?: boolean;
}

interface PerformanceWarning {
  stepName: string;
  actualMs: number;
  thresholdMs: number;
  severity: "warning" | "slow" | "critical";
}

function createTimeoutError(stepName: string, timeoutMs: number): TimeoutError {
  const suggestions: Record<string, string> = {
    "Query rewriting":
      "Try simplifying your question or check network connection",
    "Query embedding": "Model may be busy - try again in a moment",
    "Document retrieval":
      "Vector store may be large - consider reducing maxRetrievalDocs",
    "Result reranking":
      "Try disabling reranking in settings for faster results",
    "Context building": "Reduce context summary length in advanced settings",
    "Response generation":
      "Model may be complex - try a smaller model or reduce max tokens",
    "Tool execution": "Web search may be slow - check internet connection",
  };

  const error = new Error(
    `${stepName} timed out after ${(timeoutMs / 1000).toFixed(1)}s. ${suggestions[stepName] || "Try again or adjust timeout settings."}`
  ) as TimeoutError;

  error.isTimeout = true;
  error.stepName = stepName;
  error.timeoutMs = timeoutMs;
  error.suggestion = suggestions[stepName];

  return error;
}

function checkPerformance(
  stepName: string,
  durationMs: number
): PerformanceWarning | null {
  const threshold =
    PERFORMANCE_THRESHOLDS[stepName as keyof typeof PERFORMANCE_THRESHOLDS];
  if (!threshold || durationMs <= threshold) return null;

  const severity =
    durationMs > threshold * 2
      ? "critical"
      : durationMs > threshold * 1.5
        ? "slow"
        : "warning";

  return {
    stepName,
    actualMs: durationMs,
    thresholdMs: threshold,
    severity,
  };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  stepName: string,
  fallbackValue?: T
): Promise<T> {
  const startTime = Date.now();
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(createTimeoutError(stepName, timeoutMs));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);

    // Check performance after successful completion
    const duration = Date.now() - startTime;
    const perfWarning = checkPerformance(stepName, duration);
    if (perfWarning) {
      console.warn(`Performance warning for ${stepName}:`, perfWarning);
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;

    // If we have a fallback value and it's a timeout, use the fallback
    if (
      fallbackValue !== undefined &&
      error instanceof Error &&
      (error as TimeoutError).isTimeout
    ) {
      console.warn(
        `${stepName} timed out after ${duration}ms, using fallback value`
      );
      return fallbackValue;
    }
    throw error;
  }
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
    maxRetrievalDocs:
      config?.maxRetrievalDocs ?? agenticConfig.maxRetrievalDocs,
    enableQueryRewriting:
      config?.enableQueryRewriting ?? agenticConfig.enableQueryRewriting,
    enableResponseSummarization:
      config?.enableResponseSummarization ??
      agenticConfig.enableResponseSummarization,
    cachingEnabled: config?.cachingEnabled ?? agenticConfig.cachingEnabled,
    toolsEnabled: config?.toolsEnabled ?? agenticConfig.toolsEnabled ?? true,
    toolConfig: config?.toolConfig ?? {
      webSearch: {
        enabled: agenticConfig.webSearchEnabled ?? true,
        options: { maxResults: 3 },
      },
      wikipedia: { enabled: agenticConfig.wikipediaEnabled ?? true },
      news: { enabled: agenticConfig.newsSearchEnabled ?? true },
    },
    stepTimeouts: {
      ...DEFAULT_STEP_TIMEOUTS,
      ...agenticConfig.stepTimeouts,
      ...config?.stepTimeouts,
    },
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
  // Initialize tool registry if tools are enabled
  const toolRegistry =
    finalConfig.toolsEnabled && finalConfig.toolConfig
      ? new ToolRegistry(finalConfig.toolConfig)
      : null;

  const tools: Runnable[] = toolRegistry ? toolRegistry.getEnabledTools() : [];

  return {
    use(step: Runnable<unknown, unknown>) {
      tools.push(step);
      return this;
    },

    async *run(
      messages: Message[],
      signal?: AbortSignal
    ): AsyncGenerator<PipelineOutput> {
      const metrics: PipelineMetrics = {
        startTime: Date.now(),
        docsRetrieved: 0,
        tokensEstimated: 0,
        toolsUsed: 0,
        performanceWarnings: [],
        errors: [],
        cacheHits: 0,
        cacheAttempts: 0,
      };

      // Helper function to record errors in metrics
      function recordError(
        step: string,
        error: Error,
        isRecoverable: boolean = false
      ) {
        if (!metrics.errors) metrics.errors = [];
        metrics.errors.push({
          step,
          error: error.message,
          timestamp: Date.now(),
          isRecoverable,
        });
      }

      // Helper function to record performance warnings
      function recordPerformanceWarning(warning: PerformanceWarning) {
        if (!metrics.performanceWarnings) metrics.performanceWarnings = [];
        metrics.performanceWarnings.push(warning);
      }

      const aborted = () => signal?.aborted;
      let query = messages[messages.length - 1]?.content ?? "";

      if (!query.trim()) {
        yield { type: "error", message: "Query is empty" } as const;
        return;
      }

      try {
        // Query Rewriting Phase
        if (finalConfig.enableQueryRewriting) {
          yield {
            type: "status",
            message: "Rewriting query for better results",
          } as const;
          if (aborted()) return;
          const rewriteStart = Date.now();
          try {
            // Use caching for query rewriting
            const cacheKey = [query, finalConfig.embeddingModel];
            const cacheAttemptsBefore = metrics.cacheAttempts || 0;

            query = await stepCache.cached(
              "query-rewriting",
              cacheKey,
              async () => {
                return await withTimeout(
                  Promise.resolve(rewriter.rewrite(query)),
                  finalConfig.stepTimeouts?.queryRewrite ??
                    DEFAULT_STEP_TIMEOUTS.queryRewrite,
                  "Query rewriting"
                );
              },
              { ttl: 15 * 60 * 1000 } // Cache for 15 minutes
            );

            // Track cache metrics
            metrics.cacheAttempts = cacheAttemptsBefore + 1;
            const cacheStats = stepCache.getStats();
            metrics.cacheHits = cacheStats.totalHits;

            metrics.queryRewriteTime = Date.now() - rewriteStart;

            // Check performance and record any warnings
            const perfWarning = checkPerformance(
              "Query rewriting",
              metrics.queryRewriteTime
            );
            if (perfWarning) {
              recordPerformanceWarning(perfWarning);
            }

            if (!query.trim()) {
              const error = new Error("Query rewriting produced empty result");
              recordError("Query rewriting", error, false);
              yield {
                type: "error",
                message: "Query rewriting failed",
              } as const;
              return;
            }
          } catch (error) {
            const err =
              error instanceof Error ? error : new Error("Unknown error");
            recordError("Query rewriting", err, true);
            console.error("Query rewriting failed:", error);
            yield {
              type: "error",
              message:
                error instanceof Error
                  ? error.message
                  : "Query rewriting failed",
            } as const;
            return;
          }
        } // Embedding Phase
        yield { type: "status", message: "Embedding query" } as const;
        if (aborted()) return;

        const embeddingStart = Date.now();
        try {
          await withTimeout(
            embedder.embed(query),
            finalConfig.stepTimeouts?.embedding ??
              DEFAULT_STEP_TIMEOUTS.embedding,
            "Query embedding"
          );
          metrics.embeddingTime = Date.now() - embeddingStart;

          // Check performance
          const perfWarning = checkPerformance(
            "Query embedding",
            metrics.embeddingTime
          );
          if (perfWarning) {
            recordPerformanceWarning(perfWarning);
          }
        } catch (error) {
          const err =
            error instanceof Error
              ? error
              : new Error("Unknown embedding error");
          recordError("Query embedding", err, false);
          console.error("Embedding failed:", error);
          yield {
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "Failed to generate query embedding",
          } as const;
          return;
        } // Document Retrieval Phase (Multi-Turn)
        yield {
          type: "status",
          message: "Retrieving relevant documents (multi-turn)",
        } as const;
        if (aborted()) return;
        const retrievalStart = Date.now();
        let docs, multiTurnResults;
        try {
          // Adaptive retrieval depth: increase maxTurns for longer conversations
          const adaptiveMaxTurns = Math.min(
            10,
            Math.max(3, Math.floor(messages.length / 2))
          );

          // Adaptive max retrieval docs based on conversation complexity
          const baseMaxDocs = finalConfig.maxRetrievalDocs || 5;
          const adaptiveMaxDocs = Math.min(
            20,
            baseMaxDocs + Math.floor(adaptiveMaxTurns / 2)
          );

          const multiTurnConfig = {
            maxTurns: adaptiveMaxTurns,
            entityExtractionEnabled: true,
            topicTrackingEnabled: true,
            contextDecayRate: 0.8,
            minContextWeight: 0.1,
            entityBoostFactor: 1.3,
            topicBoostFactor: 1.2,
          };

          // Use caching for multi-turn retrieval results
          const multiTurnCacheKey = [
            query,
            JSON.stringify(
              messages
                .slice(-adaptiveMaxTurns)
                .map((m) => ({
                  role: m.role,
                  content: m.content.substring(0, 100),
                }))
            ),
            finalConfig.embeddingModel,
            adaptiveMaxDocs,
          ];

          multiTurnResults = await stepCache.cached(
            "multi-turn-retrieval",
            multiTurnCacheKey,
            async () => {
              return await withTimeout(
                MultiTurnRetrievalService.performMultiTurnRetrieval(
                  query,
                  messages,
                  retriever,
                  multiTurnConfig
                ),
                finalConfig.stepTimeouts?.retrieval ??
                  DEFAULT_STEP_TIMEOUTS.retrieval,
                "Multi-turn document retrieval"
              );
            },
            { ttl: 8 * 60 * 1000 } // Cache for 8 minutes
          );

          // Update cache metrics
          const cacheStats = stepCache.getStats();
          metrics.cacheAttempts = (metrics.cacheAttempts || 0) + 1;
          metrics.cacheHits = cacheStats.totalHits;
          docs = multiTurnResults.combinedDocs;
          metrics.retrievalTime = Date.now() - retrievalStart;
          metrics.docsRetrieved = docs.length;
          // Check performance
          const perfWarning = checkPerformance(
            "Document retrieval",
            metrics.retrievalTime
          );
          if (perfWarning) {
            recordPerformanceWarning(perfWarning);
          } // Limit docs based on adaptive configuration
          if (docs.length > adaptiveMaxDocs) {
            docs = docs.slice(0, adaptiveMaxDocs);
            yield {
              type: "status",
              message: `Limited to ${adaptiveMaxDocs} most relevant documents (adaptive)`,
            } as const;
          } // Yield multi-turn summary for UI/metrics
          if (multiTurnResults) {
            yield {
              type: "multi-turn-summary",
              summary:
                MultiTurnRetrievalService.formatMultiTurnSummary(
                  multiTurnResults
                ),
              metrics: multiTurnResults.relevanceMetrics,
            } as const;
          }
          yield { type: "docs", docs } as const;
        } catch (error) {
          const err =
            error instanceof Error
              ? error
              : new Error("Unknown retrieval error");
          recordError("Document retrieval", err, false);
          console.error("Document retrieval failed:", error);
          yield {
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "Failed to retrieve documents from knowledge base",
          } as const;
          return;
        } // Reranking Phase
        if (finalConfig.rerankingModel && docs.length > 1) {
          yield {
            type: "status",
            message: "Reranking results for relevance",
          } as const;
          if (aborted()) return;

          const rerankingStart = Date.now();
          try {
            docs = await withTimeout(
              reranker.rerank(docs),
              finalConfig.stepTimeouts?.reranking ??
                DEFAULT_STEP_TIMEOUTS.reranking,
              "Result reranking"
            );
            metrics.rerankingTime = Date.now() - rerankingStart;

            // Check performance
            const perfWarning = checkPerformance(
              "Result reranking",
              metrics.rerankingTime
            );
            if (perfWarning) {
              recordPerformanceWarning(perfWarning);
            }
          } catch (error) {
            const err =
              error instanceof Error
                ? error
                : new Error("Unknown reranking error");
            recordError("Result reranking", err, true); // Recoverable - we can continue with original order
            console.error("Reranking failed:", error);
            const errorMessage =
              error instanceof Error && error.message.includes("timed out")
                ? error.message
                : "Reranking failed, using original order";
            yield { type: "status", message: errorMessage } as const;
          }
        } // Context Building Phase
        const trimmed = trimmer.trim(messages);
        if (aborted()) return;

        const contextStart = Date.now();
        yield {
          type: "status",
          message: "Building context from documents",
        } as const;
        if (aborted()) return;

        let summarized;
        try {
          summarized = await withTimeout(
            contextSummarizer.summarize(docs),
            finalConfig.stepTimeouts?.contextBuilding ??
              DEFAULT_STEP_TIMEOUTS.contextBuilding,
            "Context building"
          );
          metrics.contextTime = Date.now() - contextStart;
        } catch (error) {
          console.error("Context summarization failed:", error);
          yield {
            type: "error",
            message:
              error instanceof Error
                ? error.message
                : "Failed to process document context",
          } as const;
          return;
        }

        if (aborted()) return;
        yield { type: "status", message: "Assembling final prompt" } as const;
        if (aborted()) return;
        const assembled = rag.assemble(trimmed, summarized);

        // Get conversation-specific system prompt if available
        const conversationStore = useConversationStore.getState();
        const activeConversation = conversationStore.getActiveConversation();
        const conversationSystemPrompt = activeConversation?.systemPrompt;

        // Build prompt with conversation-level system prompt override
        const effectivePromptOptions = {
          ...finalConfig.promptOptions,
          systemPrompt:
            conversationSystemPrompt || finalConfig.promptOptions?.systemPrompt,
        };
        const conversationPromptBuilder = new PromptBuilder(
          effectivePromptOptions
        );
        const prompt = conversationPromptBuilder.build(assembled);
        const tokenEstimate = prompt.split(/\s+/).filter(Boolean).length;
        metrics.tokensEstimated = tokenEstimate;

        // Enhanced thinking output with multi-turn context
        const multiTurnContext = multiTurnResults
          ? `, multi-turn: ${multiTurnResults.turnContexts.length} turns, entities: ${multiTurnResults.entityChain.length}, topics: ${multiTurnResults.topicChain.length}`
          : "";
        const thinking = `docs: ${summarized.length}, tokens: ${tokenEstimate}, retrieval: ${metrics.retrievalTime}ms${multiTurnContext}`;
        yield { type: "thinking", message: thinking } as const;
        yield { type: "tokens", count: tokenEstimate } as const;

        // Enhanced Tools Phase with Intelligent Selection
        if (finalConfig.toolsEnabled && toolRegistry && tools.length > 0) {
          // Analyze query to determine if web search would be beneficial
          const needsCurrentInfo =
            /\b(latest|recent|current|today|now|2024|2025|breaking|news)\b/i.test(
              query
            );
          const needsWebSearch =
            /\b(how to|tutorial|guide|compare|vs|review|price|buy)\b/i.test(
              query
            );
          const hasLimitedDocs = summarized.length < 2;

          if (needsCurrentInfo || needsWebSearch || hasLimitedDocs) {
            yield {
              type: "status",
              message: needsCurrentInfo
                ? "Searching for current information online"
                : needsWebSearch
                  ? "Finding relevant web resources"
                  : "Augmenting knowledge with web search",
            } as const;

            if (aborted()) return;

            const toolExecutionStart = Date.now();
            let toolsExecuted = 0;

            // Select the best tool for the query
            const bestTool = toolRegistry.selectBestTool(query);

            if (bestTool) {
              try {
                const toolOutput = await withTimeout(
                  toolRegistry.executeTool(bestTool, query),
                  finalConfig.stepTimeouts?.tools ??
                    DEFAULT_STEP_TIMEOUTS.tools,
                  `${bestTool} execution`
                );

                toolsExecuted++;
                yield {
                  type: "tool",
                  name: bestTool,
                  output: toolOutput,
                } as const;

                // Add tool results to context for the model
                summarized.push({
                  id: crypto.randomUUID(),
                  text: `Web Search Results: ${toolOutput}`,
                  metadata: { source: bestTool, timestamp: Date.now() },
                  score: 1.0,
                });
              } catch (error) {
                console.error(`Tool ${bestTool} failed:`, error);
                yield {
                  type: "status",
                  message: `${bestTool} search unavailable, using existing knowledge`,
                } as const;
              }
            }

            // If we still have few results, try a secondary tool
            if (summarized.length < 3 && toolsExecuted === 0) {
              const fallbackTools = toolRegistry
                .getAvailableTools()
                .filter((t) => t !== bestTool);

              if (fallbackTools.length > 0) {
                const fallbackTool = fallbackTools[0];
                try {
                  const toolOutput = await withTimeout(
                    toolRegistry.executeTool(fallbackTool, query),
                    finalConfig.stepTimeouts?.tools ??
                      DEFAULT_STEP_TIMEOUTS.tools,
                    `${fallbackTool} execution`
                  );

                  toolsExecuted++;
                  yield {
                    type: "tool",
                    name: fallbackTool,
                    output: toolOutput,
                  } as const;

                  summarized.push({
                    id: crypto.randomUUID(),
                    text: `Additional Search Results: ${toolOutput}`,
                    metadata: { source: fallbackTool, timestamp: Date.now() },
                    score: 0.8,
                  });
                } catch (error) {
                  console.error(`Fallback tool ${fallbackTool} failed:`, error);
                }
              }
            }

            metrics.toolExecutionTime = Date.now() - toolExecutionStart;
            metrics.toolsUsed = toolsExecuted;

            if (toolsExecuted > 0) {
              // Rebuild prompt with enhanced context including tool results
              const enhancedAssembled = rag.assemble(trimmed, summarized);
              const enhancedPrompt = promptBuilder.build(enhancedAssembled);

              // Update metrics with new token count
              const enhancedTokenEstimate = enhancedPrompt
                .split(/\s+/)
                .filter(Boolean).length;
              metrics.tokensEstimated = enhancedTokenEstimate;

              yield {
                type: "status",
                message: `Enhanced context with ${toolsExecuted} web search result${toolsExecuted > 1 ? "s" : ""}`,
              } as const;
            }
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
            messages: [{ role: "user", content: prompt }],
          })) {
            if (aborted()) return;
            full += chunk.message;
            yield { type: "chat", chunk } as const;
          }
          metrics.responseTime = Date.now() - responseStart;
        } catch (error) {
          console.error("Chat invocation failed:", error);
          yield {
            type: "error",
            message: `Model invocation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
          } as const;
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
        yield {
          type: "status",
          message: `Completed in ${metrics.totalTime}ms`,
        } as const; // Performance metrics with multi-turn context
        yield {
          type: "metrics",
          data: {
            ...metrics,
            efficiency:
              metrics.docsRetrieved > 0
                ? metrics.totalTime / metrics.docsRetrieved
                : 0,
            tokensPerSecond: metrics.responseTime
              ? metrics.tokensEstimated / (metrics.responseTime / 1000)
              : 0,
            // Multi-turn specific metrics
            multiTurnMetrics: multiTurnResults
              ? {
                  turnsAnalyzed: multiTurnResults.turnContexts.length,
                  entitiesTracked: multiTurnResults.entityChain.length,
                  topicsTracked: multiTurnResults.topicChain.length,
                  entityOverlap:
                    multiTurnResults.relevanceMetrics.entityOverlap,
                  topicContinuity:
                    multiTurnResults.relevanceMetrics.topicContinuity,
                  contextualRelevance:
                    multiTurnResults.relevanceMetrics.contextualRelevance,
                  historicalDocsRetrieved:
                    multiTurnResults.historicalDocs.length,
                  currentDocsRetrieved: multiTurnResults.currentTurnDocs.length,
                }
              : undefined,
          },
        } as const;

        // Save conversation to vector store
        if (finalConfig.cachingEnabled) {
          try {
            const docsToSave = docs.map((d) => ({
              id: crypto.randomUUID(),
              text: d.text,
              metadata: { timestamp: Date.now(), query },
            }));
            await vectorStore.addConversation(
              messages[0]?.id ?? crypto.randomUUID(),
              docsToSave
            );
          } catch (err) {
            console.error("Conversation save failed:", err);
            yield {
              type: "status",
              message: "Failed to save conversation to knowledge base",
            } as const;
          }
        } // Log the interaction
        try {
          await logger.log([
            ...messages,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: full,
            },
          ]);

          // Log metrics separately for debugging
          console.log("Pipeline metrics:", {
            metrics,
            agenticConfig: finalConfig,
          });
        } catch (err) {
          console.error("Response logging failed:", err);
        }
      } catch (error) {
        console.error("Pipeline error:", error);
        yield {
          type: "error",
          message: `Pipeline failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        } as const;
      }
    },
  };
}
