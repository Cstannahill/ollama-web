import type { Message, PromptOptions } from "@/types";

export class PromptBuilder {
  constructor(private opts?: PromptOptions) {}

  build(messages: Message[]): string {
    const system = this.opts?.systemPrompt;
    const history = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    return [system, history].filter(Boolean).join("\n");
  }
}
