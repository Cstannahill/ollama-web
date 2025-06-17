"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  vs,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useTheme } from "next-themes";

interface CodePlaygroundProps {
  code: string;
  language: string;
  title?: string;
  editable?: boolean;
  runnable?: boolean;
  className?: string;
}

export const CodePlayground: React.FC<CodePlaygroundProps> = ({
  code,
  language,
  title,
  editable = false,
  runnable = false,
  className,
}) => {
  const [currentCode, setCurrentCode] = useState(code);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();

  // Reset code when prop changes
  useEffect(() => {
    setCurrentCode(code);
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  const handleRun = async () => {
    if (!runnable) return;

    setIsRunning(true);
    setOutput("");

    try {
      // Simulate code execution for demo purposes
      // In a real implementation, this would connect to a backend service
      if (language === "javascript" || language === "js") {
        await simulateJSExecution(currentCode);
      } else if (language === "python") {
        await simulatePythonExecution(currentCode);
      } else {
        setOutput("Code execution not supported for this language yet.");
      }
    } catch (error) {
      setOutput(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setIsRunning(false);
    }
  };

  const simulateJSExecution = async (code: string) => {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // For demo purposes, we'll evaluate simple expressions
      // In production, this should use a sandboxed environment
      const result = eval(code);
      setOutput(String(result));
    } catch (error) {
      setOutput(
        `JavaScript Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };

  const simulatePythonExecution = async (code: string) => {
    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock Python execution for demo
    if (code.includes("print(")) {
      const matches = code.match(/print\(([^)]+)\)/g);
      if (matches) {
        const outputs = matches.map((match) => {
          const content = match.replace(/print\(|\)/g, "").replace(/['"]/g, "");
          return content;
        });
        setOutput(outputs.join("\n"));
      }
    } else {
      setOutput(
        "Python execution simulated - connect to backend for real execution"
      );
    }
  };

  const handleReset = () => {
    setCurrentCode(code);
    setOutput("");
  };

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-card", className)}>
      {/* Header */}
      <div className="flex items-center justify-between bg-muted/50 px-4 py-2 border-b">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          {title && (
            <span className="text-sm font-medium text-muted-foreground ml-2">
              {title}
            </span>
          )}
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {editable && (
            <button
              onClick={handleReset}
              className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              Reset
            </button>
          )}
          {runnable && (
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="text-xs px-3 py-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors disabled:opacity-50"
            >
              {isRunning ? "Running..." : "Run"}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Code Editor/Viewer */}
      <div className="relative">
        {editable ? (
          <textarea
            value={currentCode}
            onChange={(e) => setCurrentCode(e.target.value)}
            className="w-full h-64 p-4 bg-background font-mono text-sm resize-none border-none outline-none"
            style={{ fontFamily: "Fira Code, Consolas, Monaco, monospace" }}
          />
        ) : (
          <div className="overflow-x-auto">
            <SyntaxHighlighter
              language={language}
              style={theme === "dark" ? vscDarkPlus : vs}
              customStyle={{
                margin: 0,
                padding: "1rem",
                background: "transparent",
              }}
              showLineNumbers={true}
            >
              {currentCode}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Output Panel */}
      {(output || isRunning) && (
        <div className="border-t bg-muted/30">
          <div className="px-4 py-2 text-xs font-medium text-muted-foreground border-b bg-muted/50">
            Output
          </div>
          <div className="p-4 font-mono text-sm max-h-32 overflow-y-auto">
            {isRunning ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Executing code...
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{output}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodePlayground;
