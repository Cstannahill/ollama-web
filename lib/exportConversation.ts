import { ExportFormat } from "@/types";
import type { ChatMessage } from "@/types";
import { exportMarkdown } from "./exportMarkdown";

export function exportConversation(
  messages: ChatMessage[],
  format: ExportFormat,
  filename = "conversation"
): void {
  const md = messages
    .map((m) => `### ${m.role}\n${m.content}`)
    .join("\n\n");

  if (format === "json") {
    const blob = new Blob([JSON.stringify(messages, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  exportMarkdown(md, format, filename);
}
