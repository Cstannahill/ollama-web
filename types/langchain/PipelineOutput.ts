export type PipelineOutput =
  | { type: "status"; message: string }
  | { type: "thinking"; message: string }
  | { type: "tokens"; count: number }
  | { type: "docs"; docs: import("../vector").SearchResult[] }
  | { type: "chat"; chunk: import("../ollama").ChatResponse };
