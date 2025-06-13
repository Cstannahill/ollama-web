import { parseMultiTabs } from '../parseMultiTabs';

describe('parseMultiTabs', () => {
  const md = `start\n\`\`\`ts a.ts\nconsole.log('a');\n\`\`\`\n---\n\`\`\`ts b.ts\nconsole.log('b');\n\`\`\`\nend`;

  it('splits markdown into segments', () => {
    const segments = parseMultiTabs(md);
    expect(segments).toHaveLength(3);
    expect(segments[0].type).toBe('markdown');
    expect(segments[1].type).toBe('tabs');
    expect(segments[2].content.trim()).toBe('end');
  });
});
