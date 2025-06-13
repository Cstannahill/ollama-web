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
import {
  Copy,
  Check,
  Download,
  Maximize2,
  X,
  Hash,
  Search,
  Play,
  Pencil,
} from "lucide-react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import type { CodeBlock as Block, ExportFormat } from "@/types";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

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
            <Hash className="w-4 h-4" />
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
            <Search className="w-4 h-4" />
          </button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Copy code"
            onClick={handleCopy}
            className="text-gray-400 hover:text-white"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            aria-label="Download as markdown"
            onClick={() => handleDownload("markdown")}
            className="text-gray-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
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
              <Play className="w-4 h-4" />
            </button>
          )}
          {editable && (
            <button
              type="button"
              aria-label="Edit code"
              onClick={() => setEditing((e) => !e)}
              className="text-gray-400 hover:text-white"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            aria-label="Fullscreen"
            onClick={() => setFullscreen(true)}
            className="text-gray-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
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
                    <span className="select-none text-gray-500 mr-3">{i + 1}</span>
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
          <X className="w-5 h-5" />
        </button>
        {body}
      </div>
    </div>,
    document.body
  );
};
