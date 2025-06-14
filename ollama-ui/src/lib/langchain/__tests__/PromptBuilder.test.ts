import { describe, it, expect } from 'vitest';
import { PromptBuilder } from '../prompt-builder';

describe('PromptBuilder', () => {
  it('prepends system prompt', () => {
    const pb = new PromptBuilder({ systemPrompt: 'sys' });
    const prompt = pb.build([{ id: '1', role: 'user', content: 'hi' }]);
    expect(prompt.startsWith('sys')).toBe(true);
  });
});
