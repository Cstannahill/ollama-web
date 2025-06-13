import { EventEmitter } from "events";
import type {
  ChatRequest,
  ChatResponse,
  Model,
  OllamaConfig,
  PullProgress,
} from "@/types";

export class OllamaClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(private config: OllamaConfig) {
    super();
    this.connect();
  }

  private connect(): void {
    try {
      this.ws = new WebSocket(`${this.config.baseUrl}/ws`);
      this.setupEventHandlers();
    } catch (error) {
      this.handleConnectionError(error);
    }
  }

  private setupEventHandlers() {
    if (!this.ws) return;
    this.ws.onopen = () => this.emit("connected");
    this.ws.onclose = () => this.scheduleReconnect();
    this.ws.onerror = (e) => this.handleConnectionError(e);
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = this.config.timeout ?? 3000;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private handleConnectionError(error: unknown) {
    this.emit("error", error);
    this.scheduleReconnect();
  }

  async listModels(): Promise<Model[]> {
    const response = await fetch(`${this.config.baseUrl}/api/tags`);
    if (!response.ok) throw new Error("Failed to fetch models");
    return response.json();
  }

  async pullModel(
    name: string,
    onProgress?: (progress: PullProgress) => void,
  ): Promise<void> {
    const res = await fetch(`${this.config.baseUrl}/api/pull/${name}`);
    if (!res.ok) throw new Error("Failed to pull model");
    if (onProgress) {
      // Placeholder: actual streaming progress would be implemented here
      onProgress({ name, progress: 100 });
    }
  }

  async *chat(request: ChatRequest): AsyncGenerator<ChatResponse> {
    const res = await fetch(`${this.config.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!res.ok) throw new Error("Chat request failed");

    const reader = res.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield { message: decoder.decode(value) } as ChatResponse;
    }
  }
}
