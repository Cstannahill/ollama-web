export class HistoryTrimmer {
  constructor(private limit = 10) {}

  trim(messages: import("@/types").Message[]): import("@/types").Message[] {
    if (messages.length <= this.limit) return messages;
    return messages.slice(-this.limit);
  }
}
