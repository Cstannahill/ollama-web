export interface ChatSettings {
  model?: string;
  temperature: number;
  maxTokens: number;
  topP?: number;
  topK?: number;
  stream?: boolean;
  /** Custom system prompt prepended to each conversation */
  systemPrompt?: string;
}
