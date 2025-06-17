"use client";

import { useState, useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chat-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { stepCache } from "@/services/step-cache";

interface LogEntry {
  timestamp: number;
  level: "info" | "warn" | "error" | "debug";
  category: string;
  message: string;
  data?: any;
}

export function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const logEndRef = useRef<HTMLDivElement>(null);
  const { metrics, error, status } = useChatStore();

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (isOpen) {
      logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  // Capture console logs
  useEffect(() => {
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
    };

    const addLog = (
      level: LogEntry["level"],
      category: string,
      message: string,
      data?: any
    ) => {
      setLogs((prev) => [
        ...prev.slice(-499),
        {
          // Keep last 500 logs
          timestamp: Date.now(),
          level,
          category,
          message,
          data,
        },
      ]);
    };

    // Override console methods
    console.log = (...args) => {
      originalConsole.log(...args);
      addLog(
        "info",
        "console",
        args.join(" "),
        args.length > 1 ? args : undefined
      );
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      addLog(
        "warn",
        "console",
        args.join(" "),
        args.length > 1 ? args : undefined
      );
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      addLog(
        "error",
        "console",
        args.join(" "),
        args.length > 1 ? args : undefined
      );
    };

    console.debug = (...args) => {
      originalConsole.debug(...args);
      addLog(
        "debug",
        "console",
        args.join(" "),
        args.length > 1 ? args : undefined
      );
    };

    // Initial log
    addLog("info", "debug-console", "Debug console initialized");

    return () => {
      // Restore original console methods
      Object.assign(console, originalConsole);
    };
  }, []);

  // Log pipeline events
  useEffect(() => {
    if (status) {
      setLogs((prev) => [
        ...prev.slice(-499),
        {
          timestamp: Date.now(),
          level: "info",
          category: "pipeline",
          message: `Status: ${status}`,
        },
      ]);
    }
  }, [status]);

  useEffect(() => {
    if (error) {
      setLogs((prev) => [
        ...prev.slice(-499),
        {
          timestamp: Date.now(),
          level: "error",
          category: "pipeline",
          message: `Error: ${error}`,
        },
      ]);
    }
  }, [error]);

  useEffect(() => {
    if (metrics) {
      setLogs((prev) => [
        ...prev.slice(-499),
        {
          timestamp: Date.now(),
          level: "debug",
          category: "metrics",
          message: "Pipeline metrics updated",
          data: metrics,
        },
      ]);
    }
  }, [metrics]);

  const filteredLogs = logs.filter((log) => {
    const matchesText =
      !filter ||
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.category.toLowerCase().includes(filter.toLowerCase());

    const matchesLevel = levelFilter === "all" || log.level === levelFilter;

    return matchesText && matchesLevel;
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleTimeString() +
      "." +
      date.getMilliseconds().toString().padStart(3, "0")
    );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20";
      case "warn":
        return "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20";
      case "debug":
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20";
      default:
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "pipeline":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "metrics":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "console":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const logData = {
      timestamp: Date.now(),
      logs: logs,
      cacheStats: stepCache.getStats(),
      metrics: metrics,
    };

    const blob = new Blob([JSON.stringify(logData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const levelCounts = logs.reduce(
    (acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-gray-900 text-white hover:bg-gray-800 border-gray-700"
          >
            🐛 Debug Console
            {logs.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 bg-gray-700 text-gray-200"
              >
                {logs.length}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="mt-2 w-96 max-h-96 bg-gray-900 text-gray-100 rounded-lg border border-gray-700 shadow-xl">
            {/* Header */}
            <div className="p-3 border-b border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">Debug Console</h3>
                <div className="flex space-x-1">
                  <Button
                    onClick={clearLogs}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-200 h-6 px-2 text-xs"
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={exportLogs}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-gray-200 h-6 px-2 text-xs"
                  >
                    Export
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex space-x-2 mb-2">
                <Input
                  placeholder="Filter logs..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="text-xs h-6 bg-gray-800 border-gray-600 text-gray-100"
                />
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="text-xs h-6 bg-gray-800 border-gray-600 text-gray-100 rounded px-2"
                >
                  <option value="all">All</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </select>
              </div>

              {/* Level counts */}
              <div className="flex space-x-2 text-xs">
                {Object.entries(levelCounts).map(([level, count]) => (
                  <Badge
                    key={level}
                    variant="secondary"
                    className={`${getLevelColor(level)} px-1 py-0 text-xs`}
                  >
                    {level}: {count}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Logs */}
            <div className="p-2 max-h-64 overflow-y-auto text-xs space-y-1 font-mono">
              {filteredLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-4">
                  No logs match current filter
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded border-l-2 ${
                      log.level === "error"
                        ? "border-red-500 bg-red-900/10"
                        : log.level === "warn"
                          ? "border-yellow-500 bg-yellow-900/10"
                          : log.level === "debug"
                            ? "border-gray-500 bg-gray-900/10"
                            : "border-blue-500 bg-blue-900/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={`text-xs px-1 py-0 ${getLevelColor(log.level)}`}
                        >
                          {log.level.toUpperCase()}
                        </Badge>
                        <Badge
                          className={`text-xs px-1 py-0 ${getCategoryColor(log.category)}`}
                        >
                          {log.category}
                        </Badge>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {formatTime(log.timestamp)}
                      </span>
                    </div>
                    <div className="text-gray-200 text-xs break-words">
                      {log.message}
                    </div>
                    {log.data && (
                      <details className="mt-1">
                        <summary className="text-gray-400 cursor-pointer text-xs">
                          Show data
                        </summary>
                        <pre className="text-xs text-gray-300 mt-1 overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
              <div ref={logEndRef} />
            </div>

            {/* Cache Stats */}
            <div className="p-2 border-t border-gray-700 bg-gray-800">
              <div className="text-xs text-gray-400 mb-1">Cache Stats:</div>
              <div className="text-xs text-gray-300">
                Hit Rate: {Math.round(stepCache.getStats().hitRate * 100)}% (
                {stepCache.getStats().totalHits}/
                {stepCache.getStats().totalAttempts})
                <span className="ml-2">
                  Entries: {stepCache.getStats().totalEntries}
                </span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
