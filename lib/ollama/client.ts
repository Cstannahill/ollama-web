import { EventEmitter } from "events";
import type {
  ChatRequest,
  ChatResponse,
  Model,
  OllamaConfig,
  PullProgress,
} from "@/types";

export class OllamaClient extends EventEmitter {
  constructor(private config: OllamaConfig) {
    super();
  }
  async listModels(): Promise<Model[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!response.ok) throw new Error("Failed to fetch models");
      const data = await response.json();
      const rawModels = Array.isArray(data) ? data : (data.models ?? []); // Map Ollama API response to our Model interface
      return rawModels.map((model: unknown, index: number): Model => {
        const modelData = model as Record<string, unknown>;
        return {
          id: (modelData.name as string) || `model-${index}`, // Use name as id, fallback to index
          name: (modelData.name as string) || `Unknown Model ${index}`,
          description:
            (modelData.description as string) ||
            (modelData.digest as string) ||
            "No description available",
          size: modelData.size
            ? this.formatSize(modelData.size as number)
            : "Unknown",
          performance: (modelData.performance as string) || "Unknown",
          capabilities: (modelData.capabilities as string[]) || [],
        };
      });
    } catch (error) {
      this.emit("error", error);
      return [];
    }
  }

  private formatSize(bytes: number | string): string {
    if (typeof bytes === "string") return bytes;
    if (typeof bytes !== "number" || bytes === 0) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }

  async pullModel(
    name: string,
    onProgress?: (progress: PullProgress) => void
  ): Promise<void> {
    try {
      const res = await fetch(`${this.config.baseUrl}/api/pull/${name}`);
      if (!res.ok) throw new Error("Failed to pull model");
      if (onProgress) {
        onProgress({ name, progress: 100 });
      }
    } catch (error) {
      this.emit("error", error);
    }
  }
  async *chat(
    request: ChatRequest,
    signal?: AbortSignal
  ): AsyncGenerator<ChatResponse> {
    const res = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...request, stream: true }),
      signal,
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Chat request failed: ${res.status} ${errorText}`);
    }

    const reader = res.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done || signal?.aborted) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message) {
                yield { message: parsed.message.content || "" } as ChatResponse;
              }
              if (parsed.done) {
                return;
              }
            } catch (e) {
              console.warn("Failed to parse line:", line, e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
