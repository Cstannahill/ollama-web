import type { Message, ChatResponse } from "../";

export interface AgentPipeline {
  run(messages: Message[]): AsyncGenerator<ChatResponse>;
}
