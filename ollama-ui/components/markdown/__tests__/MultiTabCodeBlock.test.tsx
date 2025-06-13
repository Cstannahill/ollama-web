import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MultiTabCodeBlock } from '../MultiTabCodeBlock';
import { parseCodeBlocks } from '../parseCodeBlocks';

const md = `\n\`\`\`js filename=a.js\nconsole.log('a');\n\`\`\`\n\`\`\`python\nprint('b')\n\`\`\``;

function key() {
  const blocks = parseCodeBlocks(md);
  const names = blocks.map(b => b.filename || '').join('|');
  let hash = 0;
  for (let i = 0; i < names.length; i++) {
    hash = (hash << 5) - hash + names.charCodeAt(i);
    hash |= 0;
  }
  return `mtcb-${hash}`;
}

describe('MultiTabCodeBlock localStorage', () => {
  it('restores active tab from localStorage', () => {
    localStorage.setItem(key(), '1');
    const { getByText } = render(<MultiTabCodeBlock markdown={md} />);
    expect(getByText('python').getAttribute('aria-selected')).toBe('true');
    fireEvent.click(getByText('a.js'));
    expect(localStorage.getItem(key())).toBe('0');
  });
});
