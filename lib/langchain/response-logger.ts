export class ResponseLogger {
  async log(messages: import("@/types").Message[]): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const existing = JSON.parse(localStorage.getItem("ollama.logs") || "[]");
      existing.push({ timestamp: Date.now(), messages });
      localStorage.setItem("ollama.logs", JSON.stringify(existing));
    } catch (error) {
      console.error("ResponseLogger error", error);
    }
  }
}
