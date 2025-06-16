export type PipelineOutput =
  | { type: "status"; message: string }
  | { type: "thinking"; message: string }
  | { type: "tokens"; count: number }
  | { type: "docs"; docs: import("../vector").SearchResult[] }
  | { type: "chat"; chunk: import("../ollama").ChatResponse }
  | { type: "summary"; message: string }
  | { type: "tool"; name: string; output: string }
  | { type: "metrics"; data: { startTime: number; queryRewriteTime?: number; embeddingTime?: number; retrievalTime?: number; rerankingTime?: number; contextTime?: number; responseTime?: number; totalTime?: number; docsRetrieved: number; tokensEstimated: number; efficiency: number; tokensPerSecond: number } }
  | { type: "error"; message: string };
