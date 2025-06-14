export class ResponseSummarizer {
  summarize(text: string): string {
    const first = text.split(/\n|\./)[0] || "";
    return first.trim().slice(0, 100);
  }
}
