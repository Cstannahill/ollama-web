export interface Model {
  id: string;
  name: string;
  /** Optional short description of the model */
  description?: string;
  size: string;
  /** Typical tokens per second */
  performance?: string;
  /** Capability categories like "Vision", "Code", etc. */
  capabilities?: string[];
  /** Whether the model is locally downloaded/pulled */
  isDownloaded?: boolean;
}
