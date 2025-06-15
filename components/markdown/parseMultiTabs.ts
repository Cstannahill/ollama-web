export interface MarkdownSegment {
  type: 'markdown' | 'tabs';
  content: string;
}

export function parseMultiTabs(markdown: string): MarkdownSegment[] {
  const regex = /```[\s\S]*?```\n(?:---\n```[\s\S]*?```\n?)+/g;
  const segments: MarkdownSegment[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown))) {
    if (match.index > last) {
      segments.push({ type: 'markdown', content: markdown.slice(last, match.index) });
    }
    segments.push({ type: 'tabs', content: match[0].trim() });
    last = regex.lastIndex;
  }
  if (last < markdown.length) {
    segments.push({ type: 'markdown', content: markdown.slice(last) });
  }
  return segments;
}
