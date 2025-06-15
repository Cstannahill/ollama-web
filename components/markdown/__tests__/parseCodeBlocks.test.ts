import { parseCodeBlocks } from '../parseCodeBlocks';

const md = `
Some text
\`\`\`ts filename=app.ts
console.log('hi');
\`\`\`
\`\`\`server.py
print('hi')
\`\`\`
`;

const mdHighlight = `\n\`\`\`js {highlight: [1,3-4]}\nline1\nline2\nline3\nline4\n\`\`\``;

describe('parseCodeBlocks', () => {
  it('parses blocks with language and filename', () => {
    const blocks = parseCodeBlocks(md);
    expect(blocks).toHaveLength(2);
    expect(blocks[0].filename).toBe('app.ts');
    expect(blocks[0].language).toBe('typescript');
    expect(blocks[1].language).toBe('python');
  });

  it('parses highlight metadata', () => {
    const blocks = parseCodeBlocks(mdHighlight);
    expect(blocks[0].highlight).toEqual([1, 3, 4]);
  });
});
