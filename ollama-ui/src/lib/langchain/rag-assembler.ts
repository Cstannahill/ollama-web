import type { Message, SearchResult } from "@/types";

export class RagAssembler {
  assemble(messages: Message[], docs: SearchResult[]): Message[] {
    const systemMessages = docs.map((d) => ({
      id: crypto.randomUUID(),
      role: "system" as const,
      content: d.text,
    }));
    return [...messages, ...systemMessages];
  }
}
