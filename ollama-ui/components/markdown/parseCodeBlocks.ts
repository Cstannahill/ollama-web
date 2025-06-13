import type { CodeBlock } from "@/types";

const extToLang: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  css: "css",
  sql: "sql",
  sh: "bash",
  bash: "bash",
};

export function parseCodeBlocks(markdown: string): CodeBlock[] {
  const blocks: CodeBlock[] = [];
  const regex = /```([^\n]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(markdown))) {
    const info = match[1].trim();
    const code = match[2].replace(/\n$/, "");
    let language = "";
    let filename: string | undefined;

    if (info.includes("filename=")) {
      const parts = info.split(/\s+/);
      for (const part of parts) {
        if (part.startsWith("filename=")) {
          filename = part.split("=")[1];
        } else if (!language) {
          language = extToLang[part] || part;
        }
      }
    } else if (/\.[\w]+$/.test(info)) {
      filename = info;
    } else if (info) {
      language = extToLang[info] || info;
    }

    if (!language && filename) {
      const ext = filename.split(".").pop() || "";
      language = extToLang[ext] || ext;
    }

    language = extToLang[language] || language;

    blocks.push({ code, language, filename });
  }
  return blocks;
}
