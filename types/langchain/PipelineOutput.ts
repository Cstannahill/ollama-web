export type PipelineOutput =
  | { type: "status"; message: string }
  | { type: "thinking"; message: string }
  | { type: "chat"; chunk: import("../ollama").ChatResponse };
