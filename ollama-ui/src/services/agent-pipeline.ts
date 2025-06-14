import {
  Runnable,
  RunnableSequence,
  RunnableLambda,
} from "@langchain/core/runnables";
import { VectorStoreRetriever } from "@/lib/langchain/vector-retriever";
import { PromptBuilder } from "@/lib/langchain/prompt-builder";
import { OllamaChat } from "@/lib/langchain/ollama-chat";
import type { ChatSettings, Message, ChatResponse, SearchResult } from "@/types";

export function createAgentPipeline(settings: ChatSettings) {
  const retriever = new VectorStoreRetriever();
  const promptBuilder = new PromptBuilder();
  const chat = new OllamaChat(settings);

  let chain: Runnable<Message[], unknown> = RunnableSequence.from([
    RunnableLambda.from(async (messages: Message[]) => {
      const query = messages[messages.length - 1]?.content ?? "";
      const docs = await retriever.getRelevantDocuments(query);
      return { messages, docs } as { messages: Message[]; docs: SearchResult[] };
    }),
    RunnableLambda.from(async ({ messages, docs }: { messages: Message[]; docs: SearchResult[] }) => {
      const systemMessages = docs.map((d) => ({ id: crypto.randomUUID(), role: "system" as const, content: d.text }));
      return promptBuilder.build([...messages, ...systemMessages]);
    }),
    RunnableLambda.from(async (prompt: string) => chat.invoke({ model: "llama3", messages: [{ role: "user", content: prompt }] })),
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
