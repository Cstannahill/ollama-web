import type { ChatRequest, ChatResponse, ChatSettings } from "@/types";
import { OllamaClient } from "@/lib/ollama/client";
import { OLLAMA_BASE_URL } from "@/lib/config";

export class OllamaChat {
  private client: OllamaClient;

  constructor(private settings: ChatSettings & { baseUrl?: string }) {
    this.client = new OllamaClient({
      baseUrl: settings.baseUrl || OLLAMA_BASE_URL,
    });
  }

  async *invoke(request: ChatRequest): AsyncGenerator<ChatResponse> {
    try {
      for await (const chunk of this.client.chat(request)) {
        yield chunk;
      }
    } catch (error) {
      console.error("OllamaChat error", error);
      return;
    }
  }
}
