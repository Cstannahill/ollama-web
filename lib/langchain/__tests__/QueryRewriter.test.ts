import { describe, it, expect } from 'vitest';
import { QueryRewriter } from '../query-rewriter';

describe('QueryRewriter', () => {
  it('expands abbreviations', () => {
    const qr = new QueryRewriter();
    expect(qr.rewrite('learn JS')).toContain('JavaScript');
  });
});
