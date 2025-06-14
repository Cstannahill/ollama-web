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
