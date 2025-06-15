import { ExportFormat } from "@/types";

export function exportMarkdown(
  content: string,
  format: ExportFormat,
  filename = "document"
): void {
  let data = content;
  let mime = "text/markdown";

  if (format === "html") {
    data = `<html><body>${content}</body></html>`;
    mime = "text/html";
  }

  if (format === "pdf") {
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<pre>${content}</pre>`);
      win.print();
      win.close();
    }
    return;
  }

  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${format === "markdown" ? "md" : format}`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function createShareLink(content: string): Promise<string> {
  try {
    const res = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: "Shared markdown",
        public: true,
        files: { "share.md": { content } },
      }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.html_url as string;
    }
  } catch {
    // ignore network errors and fall back to Blob URL
  }
  const blob = new Blob([content], { type: "text/markdown" });
  return URL.createObjectURL(blob);
}
