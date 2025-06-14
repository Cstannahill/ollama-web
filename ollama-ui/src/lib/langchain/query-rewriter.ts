export class QueryRewriter {
  rewrite(text: string): string {
    try {
      const map: Record<string, string> = {
        JS: "JavaScript",
        TS: "TypeScript",
      };
      return text.replace(/\b(JS|TS)\b/g, (m) => map[m] || m);
    } catch (error) {
      console.error("QueryRewriter error", error);
      return text;
    }
  }
}
