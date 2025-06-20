import { describe, it, expect, vi } from 'vitest';
import { createAgentPipeline } from '../../../services/agent-pipeline';
import type { PipelineOutput } from '@/types';

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
    const outputs: PipelineOutput[] = [];
    for await (const out of pipeline.run([{ id: '1', role: 'user', content: 'hi' }])) {
      outputs.push(out);
    }
    const chat = outputs.find(o => o.type === 'chat');
    expect(chat.chunk.message).toBe('hello');
    const docs = outputs.find(o => o.type === 'docs');
    expect(docs).toBeTruthy();
    const thinking = outputs.find(o => o.type === 'thinking');
    expect(thinking).toBeTruthy();

    const summary = outputs.find(o => o.type === 'summary');
    expect(summary).toBeTruthy();

    const tokens = outputs.find(o => o.type === 'tokens');
    expect(tokens.count).toBeGreaterThan(0);
    const pipe = createAgentPipeline({
      temperature: 0,
      maxTokens: 0,
      systemPrompt: '',
    });
    const iter = pipe.run([{ id: '1', role: 'user', content: 'hello' }]);
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
