export interface OllamaStatus {
  connected: boolean;
  version: string;
  latency: number;
  modelCount: number;
  lastChecked: Date;
}
