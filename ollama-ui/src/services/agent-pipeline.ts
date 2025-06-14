import {
  Runnable,
  RunnableSequence,
  RunnableLambda,
} from "@langchain/core/runnables";
import { VectorStoreRetriever } from "@/lib/langchain/vector-retriever";
import { PromptBuilder } from "@/lib/langchain/prompt-builder";
import { OllamaChat } from "@/lib/langchain/ollama-chat";
import { QueryEmbedder } from "@/lib/langchain/query-embedder";
import { Reranker } from "@/lib/langchain/reranker";
import { RagAssembler } from "@/lib/langchain/rag-assembler";
import type {
  ChatSettings,
  Message,
  ChatResponse,
  SearchResult,
  Embedding,
  PromptOptions,
} from "@/types";

export interface PipelineConfig extends ChatSettings {
  embeddingModel?: string | null;
  rerankingModel?: string | null;
  promptOptions?: PromptOptions;
}

export function createAgentPipeline(config: PipelineConfig) {
  const { embeddingModel, rerankingModel, promptOptions, ...chatSettings } = config;
  const retriever = new VectorStoreRetriever();
  const embedder = new QueryEmbedder(embeddingModel);
  const reranker = new Reranker(rerankingModel);
  const rag = new RagAssembler();
  const promptBuilder = new PromptBuilder(promptOptions);
  const chat = new OllamaChat(chatSettings);

  let chain: Runnable<Message[], unknown> = RunnableSequence.from([
    RunnableLambda.from(async (messages: Message[]) => {
      const query = messages[messages.length - 1]?.content ?? "";
      const embedding = await embedder.embed(query);
      return { messages, query, embedding } as {
        messages: Message[];
        query: string;
        embedding: Embedding;
      };
    }),
    RunnableLambda.from(async ({ query }: { query: string }) => {
      const docs = await retriever.getRelevantDocuments(query);
      return { query, docs } as { query: string; docs: SearchResult[] };
    }),
    RunnableLambda.from(async ({ messages, docs }: { messages: Message[]; docs: SearchResult[] }) => {
      const ranked = await reranker.rerank(docs);
      const assembled = rag.assemble(messages, ranked);
      return promptBuilder.build(assembled);
    }),
    RunnableLambda.from(async (prompt: string) =>
      chat.invoke({ model: "llama3", messages: [{ role: "user", content: prompt }] }),
    ),
  ]);

  const pipeline = {
    use(step: Runnable<unknown, unknown>) {
      chain = chain.pipe(step);
      return this;
    },
    async *run(messages: Message[]): AsyncGenerator<ChatResponse> {
      const stream = await chain.stream(messages);
      for await (const chunk of stream) {
        yield chunk as ChatResponse;
      }
    },
  };

  return pipeline;
}
