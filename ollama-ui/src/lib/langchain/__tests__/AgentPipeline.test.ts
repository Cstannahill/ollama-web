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
    const pipeline = createAgentPipeline({
      temperature: 0,
      maxTokens: 0,
      systemPrompt: '',
    });
    const iter = pipeline.run([{ id: '1', role: 'user', content: 'hello' }]);
    let result: string | undefined;
    for await (const out of iter) {
      if (out.type === 'chat') {
        result = out.chunk.message;
        break;
      }
    }
    expect(result).toBe('hello');
  });
});
