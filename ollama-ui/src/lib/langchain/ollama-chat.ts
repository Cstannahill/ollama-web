import type { ChatRequest, ChatResponse, ChatSettings } from "@/types";
import { OllamaClient } from "@/lib/ollama/client";

export class OllamaChat {
  private client: OllamaClient;

  constructor(private settings: ChatSettings & { baseUrl?: string }) {
    this.client = new OllamaClient({
      baseUrl: settings.baseUrl || "http://localhost:11434",
    });
  }

  async *invoke(request: ChatRequest): AsyncGenerator<ChatResponse> {
    for await (const chunk of this.client.chat(request)) {
      yield chunk;
    }
  }
}
