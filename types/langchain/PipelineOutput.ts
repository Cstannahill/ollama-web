export type PipelineOutput =
  | { type: "status"; message: string }
  | { type: "chat"; chunk: import("../ollama").ChatResponse };
