import { describe, it, expect, vi } from 'vitest';
import { createAgentPipeline } from '../../../services/agent-pipeline';

vi.mock('../vector-retriever', () => ({
  VectorStoreRetriever: class {
    async getRelevantDocuments() { return []; }
  },
}));
vi.mock('../ollama-chat', () => ({
  OllamaChat: class {
    async *invoke() { yield { message: 'hello' }; }
  },
}));
vi.mock('../../../services/reranker-service', () => ({
  RerankerService: class { async rerank(q: string, d: unknown[]) { return d; } },
}));

describe('AgentPipeline', () => {
  it('runs pipeline', async () => {
    const pipeline = createAgentPipeline({ temperature: 0, maxTokens: 0, systemPrompt: '' });
    const iter = pipeline.run([]);
    const { value } = await iter.next();
    expect(value?.message).toBe('hello');
  });
});
