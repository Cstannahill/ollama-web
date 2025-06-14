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
    const outputs = [] as any[];
    for await (const out of pipeline.run([{ id: '1', role: 'user', content: 'hi' }])) {
      outputs.push(out);
    }
    const chat = outputs.find(o => o.type === 'chat');
    expect(chat.chunk.message).toBe('hello');
    const thinking = outputs.find(o => o.type === 'thinking');
    expect(thinking).toBeTruthy();
  });
});
