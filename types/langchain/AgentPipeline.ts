import type { Message } from "../";
import type { PipelineOutput } from "./PipelineOutput";

export interface AgentPipeline {
  run(messages: Message[]): AsyncGenerator<PipelineOutput>;
}
