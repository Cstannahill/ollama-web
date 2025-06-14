export interface ChatSettings {
  temperature: number;
  maxTokens: number;
  /** Custom system prompt prepended to each conversation */
  systemPrompt?: string;
}
