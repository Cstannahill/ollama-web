"use client";
import { useState, useEffect, useId, useMemo } from "react";
import Prism from "prismjs";

const loadLanguage = async (lang: string) => {
  if (!lang || Prism.languages[lang]) return;
  try {
    await import(`prismjs/components/prism-${lang}.js`);
  } catch {
    // ignore missing language
  }
};
// Custom icons to avoid lucide-react issues
const Copy = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const Check = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

const Download = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const Maximize2 = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 3h6v6m-6 0l6-6M9 21H3v-6m6 0l-6 6"
    />
  </svg>
);

const X = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const Hash = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
    />
  </svg>
);

const Search = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const Play = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a1 1 0 01-1 1H6.5a1 1 0 01-1-1v-4a1 1 0 011-1H8a1 1 0 011 1zm3 0h2.5a1 1 0 011 1v4a1 1 0 01-1 1H12"
    />
  </svg>
);

const Pencil = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import type { CodeBlock as Block, ExportFormat } from "@/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const execute = (src: string, lang: string): Promise<string> => {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.sandbox.add("allow-scripts");
    iframe.style.display = "none";
    const handler = (e: MessageEvent) => {
      if (e.source === iframe.contentWindow) {
        resolve(typeof e.data === "string" ? e.data : JSON.stringify(e.data));
        window.removeEventListener("message", handler);
        iframe.remove();
      }
    };
    window.addEventListener("message", handler);
    if (lang === "javascript") {
      iframe.srcdoc = `<script>window.parent.postMessage((()=>{try{return eval(${JSON.stringify(
        src
      )});}catch(e){return 'Error: '+e.message}})(),'*');<\/script>`;
    } else {
      iframe.srcdoc = `<!doctype html><script src="https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js"></script><script>async function r(){const p=await loadPyodide();try{const res=await p.runPythonAsync(${JSON.stringify(
        src
      )});parent.postMessage(res,'*');}catch(e){parent.postMessage('Error: '+e.message,'*')}}r();<\/script>`;
    }
    document.body.appendChild(iframe);
  });
};

interface CodeBlockProps extends Block {
  search?: string;
  onSearchChange?: (value: string) => void;
  /** show run button and execute code */
  runnable?: boolean;
  /** enable editing via Monaco */
  editable?: boolean;
  /** callback when code is run */
  onRunResult?: (output: string) => void;
  /** callback when edited code is saved */
  onCodeChange?: (code: string) => void;
}

export const CodeBlock = ({
  code,
  language,
  filename,
  highlight = [],
  search: externalSearch = "",
  onSearchChange,
  runnable = language === "javascript" || language === "python",
  editable = false,
  onRunResult,
  onCodeChange,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [search, setSearch] = useState(externalSearch);
  const [highlighted, setHighlighted] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [codeText, setCodeText] = useState(code);
  const [runOutput, setRunOutput] = useState<string>("");
  const id = useId();
  const storageKey = useMemo(() => `cb-${id}`, [id]);

  useEffect(() => {
    setSearch(externalSearch);
  }, [externalSearch]);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setCodeText(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    if (editing) {
      localStorage.setItem(storageKey, codeText);
      onCodeChange?.(codeText);
    }
  }, [codeText, editing, storageKey, onCodeChange]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadLanguage(language);
      const html = Prism.highlight(
        codeText,
        Prism.languages[language] || Prism.languages.plain,
        language
      );
      if (!cancelled) {
        setHighlighted(html.trimEnd().split("\n"));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [codeText, language]);

  useEffect(() => {
    if (!search) {
      setFiltered(highlighted);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      highlighted.map((l) =>
        l.toLowerCase().includes(q)
          ? l.replace(new RegExp(q, "gi"), (m) => `<mark>${m}</mark>`)
          : l
      )
    );
  }, [search, highlighted]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore copy errors
    }
  };

  const handleDownload = (format: ExportFormat) => {
    let data = codeText;
    let mime = "text/plain";
    if (format === "html") {
      data = `<pre>${codeText}</pre>`;
      mime = "text/html";
    }
    if (format === "pdf") {
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(`<pre>${codeText}</pre>`);
        win.print();
        win.close();
      }
      return;
    }
    const blob = new Blob([data], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = filtered;

  const body = (
    <div className="bg-gray-900 rounded-md overflow-hidden text-sm mb-4">
      {filename && (
        <div className="px-3 py-1 bg-gray-800 text-xs font-mono text-gray-300">
          {filename}
        </div>
      )}
      <div className="flex justify-between items-center px-3 pt-2">
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Toggle line numbers"
            onClick={() => setShowNumbers((n) => !n)}
            className="text-gray-400 hover:text-white"
          >
            <Hash className="w-4 h-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Search code"
            onClick={() => {
              const el = document.getElementById(`code-search-${id}`);
              el?.focus();
            }}
            className="text-gray-400 hover:text-white"
          >
            <Search className="w-4 h-4" aria-hidden />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Copy code"
            onClick={handleCopy}
            className="text-gray-400 hover:text-white"
          >
            {copied ? (
              <Check className="w-4 h-4" aria-hidden />
            ) : (
              <Copy className="w-4 h-4" aria-hidden />
            )}
          </button>
          <button
            type="button"
            aria-label="Download as markdown"
            onClick={() => handleDownload("markdown")}
            className="text-gray-400 hover:text-white"
          >
            <Download className="w-4 h-4" aria-hidden />
          </button>
          {runnable && (
            <button
              type="button"
              aria-label="Run code"
              onClick={async () => {
                const out = await execute(codeText, language);
                setRunOutput(out);
                onRunResult?.(out);
              }}
              className="text-gray-400 hover:text-white"
            >
              <Play className="w-4 h-4" aria-hidden />
            </button>
          )}
          {editable && (
            <button
              type="button"
              aria-label="Edit code"
              onClick={() => setEditing((e) => !e)}
              className="text-gray-400 hover:text-white"
            >
              <Pencil className="w-4 h-4" aria-hidden />
            </button>
          )}
          <button
            type="button"
            aria-label="Fullscreen"
            onClick={() => setFullscreen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" aria-hidden />
          </button>
        </div>
      </div>
      <div className="px-3 pb-2">
        <input
          id={`code-search-${id}`}
          aria-label="Search in code"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            onSearchChange?.(e.target.value);
          }}
          className="mb-2 w-full rounded bg-gray-800 px-2 py-1 text-xs outline-none"
          placeholder="Search..."
        />
        {editing ? (
          <div className="h-72">
            <MonacoEditor
              language={language}
              value={codeText}
              onChange={(val) => setCodeText(val || "")}
              theme="vs-dark"
              height="100%"
            />
          </div>
        ) : (
          <pre className="relative overflow-x-auto">
            <code className={`language-${language} block`}>
              {lines.map((line, i) => (
                <div
                  key={i}
                  className={`whitespace-pre ${highlight.includes(i + 1) ? "bg-yellow-900/40" : ""}`}
                >
                  {showNumbers && (
                    <span className="select-none text-gray-500 mr-3">
                      {i + 1}
                    </span>
                  )}
                  <span dangerouslySetInnerHTML={{ __html: line }} />
                </div>
              ))}
            </code>
          </pre>
        )}
        {runOutput && (
          <pre className="mt-2 p-2 bg-gray-800 rounded text-xs overflow-auto">
            {runOutput}
          </pre>
        )}
      </div>
    </div>
  );

  if (!fullscreen) return body;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative max-h-full overflow-auto w-full max-w-4xl">
        <button
          type="button"
          aria-label="Close fullscreen"
          onClick={() => setFullscreen(false)}
          className="absolute top-2 right-2 text-white"
        >
          <X className="w-5 h-5" aria-hidden />
        </button>
        {body}
      </div>
    </div>,
    document.body
  );
};
