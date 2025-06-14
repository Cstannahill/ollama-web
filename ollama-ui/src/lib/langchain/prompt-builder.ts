import type { Message, PromptOptions } from "@/types";

export class PromptBuilder {
  constructor(private opts?: PromptOptions) {}

  build(messages: Message[]): string {
    const system = this.opts?.systemPrompt;
    const instructions = this.opts?.instructions?.join("\n");
    const history = messages.map((m) => `${m.role}: ${m.content}`).join("\n");
    const preamble = [system, instructions].filter(Boolean).join("\n");
    return [preamble, history].filter(Boolean).join("\n");
  }
}
