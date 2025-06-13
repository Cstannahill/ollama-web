export interface Document {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
}
