import { Runnable } from "@langchain/core/runnables";
import { VectorStoreRetriever } from "@/lib/langchain/vector-retriever";
import { PromptBuilder } from "@/lib/langchain/prompt-builder";
import { OllamaChat } from "@/lib/langchain/ollama-chat";
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


  const tools: Runnable[] = [];

  const pipeline = {
    use(step: Runnable<unknown, unknown>) {
      tools.push(step);
      return this;
    },
    async *run(messages: Message[]): AsyncGenerator<PipelineOutput> {
      const query = messages[messages.length - 1]?.content ?? "";
      yield { type: "status", message: "Embedding query" } as const;
      try {
        await embedder.embed(query);
      } catch (error) {
        console.error("Embedder failed", error);
        yield { type: "status", message: "Embedding failed" } as const;
      }

      yield { type: "status", message: "Retrieving documents" } as const;
      let docs: SearchResult[] = [];
      try {
        docs = await retriever.getRelevantDocuments(query);
      } catch (error) {
        console.error("Retrieval failed", error);
        yield { type: "status", message: "Retrieval failed" } as const;
      }

      yield { type: "status", message: "Reranking results" } as const;
      let ranked = docs;
      try {
        ranked = await reranker.rerank(docs);
      } catch (error) {
        console.error("Reranking failed", error);
      }

      const assembled = rag.assemble(messages, ranked);
      const prompt = promptBuilder.build(assembled);

      for (const tool of tools) {
        await tool.invoke(prompt);
      }

      yield { type: "status", message: "Invoking model" } as const;
      try {
        for await (const chunk of chat.invoke({ model: "llama3", messages: [{ role: "user", content: prompt }] })) {
          yield { type: "chat", chunk } as const;
        }
        yield { type: "status", message: "Completed" } as const;
      } catch (error) {
        console.error("Chat invocation failed", error);
        yield { type: "status", message: "Model invocation failed" } as const;
      }
    },
  };

  return pipeline;
}
