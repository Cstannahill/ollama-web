# Advanced Chat Components Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the advanced chat components template in your existing ollama-web project. It focuses on practical integration steps and immediate improvements to enhance the chat experience.

## Phase 1: Core Foundation (Immediate Implementation)

### 1.1 Enhanced ChatInterface Integration

Based on your existing `components/chat/ChatInterface.tsx`, we need to add the auto-component selection logic:

```tsx
// components/chat/EnhancedChatInterface.tsx
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { MultiTurnSummary } from "./MultiTurnSummary";
import { DocumentSources } from "./DocumentSources";
import { ProcessingMetrics } from "./ProcessingMetrics";

interface EnhancedChatInterfaceProps {
  messages: Message[];
  isStreaming?: boolean;
  className?: string;
}

export const EnhancedChatInterface = ({
  messages,
  isStreaming,
  className,
}: EnhancedChatInterfaceProps) => {
  const { docs, metrics, multiTurnSummary } = useChatStore();

  // Auto-detect which components to render based on available data
  const presentationalComponents = useMemo(() => {
    const components = [];

    if (multiTurnSummary) {
      components.push({
        id: "multi-turn",
        component: MultiTurnSummary,
        props: multiTurnSummary,
        priority: 1,
      });
    }

    if (docs?.length > 0) {
      components.push({
        id: "docs",
        component: DocumentSources,
        props: { sources: docs },
        priority: 2,
      });
    }

    if (metrics) {
      components.push({
        id: "metrics",
        component: ProcessingMetrics,
        props: { data: metrics },
        priority: 3,
      });
    }

    return components.sort((a, b) => a.priority - b.priority);
  }, [docs, metrics, multiTurnSummary]);

  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Enhanced Messages */}
      <div className="flex-1 space-y-4">
        {messages.map((message) => (
          <EnhancedChatMessage key={message.id} message={message} />
        ))}
        {isStreaming && <TypingIndicator />}
      </div>

      {/* Auto-rendered Presentational Components */}
      <AnimatePresence mode="sync">
        {presentationalComponents.map(({ id, component: Component, props }) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Component {...props} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
```

### 1.2 Enhanced Message Component

Upgrade your existing `ChatMessage` component with auto-content detection:

````tsx
// components/chat/EnhancedChatMessage.tsx
import { useMemo } from "react";
import { ChatMarkdownViewer } from "../markdown/ChatMarkdownViewer";
import { CodePlayground } from "./CodePlayground";
import { InteractiveDataTable } from "./InteractiveDataTable";

export const EnhancedChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === "user";

  // Auto-detect content type and select appropriate renderer
  const contentRenderer = useMemo(() => {
    const content = message.content;

    // Detect executable code blocks
    if (/```\w+ executable/.test(content)) {
      return (
        <CodePlayground
          initialCode={extractCode(content)}
          language={extractLanguage(content)}
        />
      );
    }

    // Detect data tables
    if (/\|.*\|.*\|/.test(content)) {
      return (
        <InteractiveDataTable
          data={parseTableData(content)}
          content={content}
        />
      );
    }

    // Detect complex markdown (diagrams, math, etc.)
    if (hasComplexMarkdown(content)) {
      return (
        <ChatMarkdownViewer
          content={content}
          features={{
            codeHighlighting: true,
            mathRendering: true,
            diagramSupport: true,
            tableFormatting: true,
          }}
        />
      );
    }

    // Default markdown rendering
    return <ChatMarkdownViewer content={content} />;
  }, [message.content]);

  return (
    <div
      className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "relative max-w-4xl w-full px-4 py-3 rounded-lg shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground ml-8"
            : "bg-muted/50 text-foreground mr-8"
        )}
      >
        {contentRenderer}
      </div>
    </div>
  );
};

// Helper functions
const hasComplexMarkdown = (content: string): boolean => {
  return (
    content.includes("```mermaid") ||
    content.includes("$$") ||
    content.includes("```math") ||
    content.includes("graph TD") ||
    content.includes("sequenceDiagram")
  );
};

const extractCode = (content: string): string => {
  const match = content.match(/```\w+ executable\n([\s\S]*?)```/);
  return match ? match[1] : "";
};

const extractLanguage = (content: string): string => {
  const match = content.match(/```(\w+) executable/);
  return match ? match[1] : "javascript";
};

const parseTableData = (content: string): any[] => {
  // Parse markdown table into structured data
  const lines = content.split("\n").filter((line) => line.includes("|"));
  const headers = lines[0]
    .split("|")
    .map((h) => h.trim())
    .filter(Boolean);
  const rows = lines.slice(2).map((line) =>
    line
      .split("|")
      .map((cell) => cell.trim())
      .filter(Boolean)
  );

  return rows.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || "";
    });
    return obj;
  });
};
````

## Phase 2: Interactive Components (Week 1)

### 2.1 Code Playground Implementation

Create an interactive code playground component:

```tsx
// components/chat/CodePlayground.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Copy, Download, RotateCcw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const CodePlayground = ({
  initialCode,
  language,
  readOnly = false,
}: {
  initialCode: string;
  language: string;
  readOnly?: boolean;
}) => {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    try {
      // For now, simulate code execution
      // Later integrate with actual execution service
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setOutput(
        `Code executed successfully!\nLanguage: ${language}\nCode length: ${code.length} characters`
      );
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const resetCode = () => {
    setCode(initialCode);
    setOutput("");
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Interactive Code - {language}</h4>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyCode}>
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={resetCode}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={runCode} disabled={isRunning}>
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Running..." : "Run"}
          </Button>
        </div>
      </div>

      <Textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        readOnly={readOnly}
        className="min-h-[200px] font-mono text-sm"
        placeholder="Enter your code here..."
      />

      {output && (
        <div className="border rounded-lg bg-muted/50">
          <div className="px-3 py-2 border-b bg-muted/80">
            <h5 className="text-sm font-medium">Output</h5>
          </div>
          <div className="p-3">
            <pre className="text-sm whitespace-pre-wrap">{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
```

### 2.2 Interactive Data Table

Enhance your data display capabilities:

```tsx
// components/chat/InteractiveDataTable.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Filter, Download } from "lucide-react";

export const InteractiveDataTable = ({
  data,
  content,
}: {
  data: any[];
  content: string;
}) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filter, setFilter] = useState("");

  if (!data.length) {
    return <div className="p-4 text-muted-foreground">No data to display</div>;
  }

  const headers = Object.keys(data[0]);

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(filter.toLowerCase())
    )
  );

  const sortedData = sortField
    ? filteredData.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const direction = sortDirection === "asc" ? 1 : -1;
        return aVal > bVal ? direction : -direction;
      })
    : filteredData;

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const exportData = () => {
    const csv = [
      headers.join(","),
      ...sortedData.map((row) => headers.map((h) => row[h]).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    a.click();
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">
          Data Table ({sortedData.length} rows)
        </h4>
        <div className="flex gap-2">
          <Input
            placeholder="Filter data..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((header) => (
                <th
                  key={header}
                  className="border border-border p-2 text-left cursor-pointer hover:bg-muted/70"
                  onClick={() => toggleSort(header)}
                >
                  <div className="flex items-center gap-2">
                    {header}
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr key={index} className="hover:bg-muted/30">
                {headers.map((header) => (
                  <td key={header} className="border border-border p-2">
                    {String(row[header])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

## Phase 3: Integration with Existing Pipeline (Week 2)

### 3.1 Update Chat Store

Modify your existing `stores/chat-store.ts` to handle enhanced responses:

````typescript
// Add to your existing chat store interface
interface EnhancedMessage extends Message {
  componentType?:
    | "default"
    | "code-playground"
    | "data-table"
    | "metrics"
    | "timeline";
  interactionMetadata?: {
    isInteractive: boolean;
    features: string[];
    exportable: boolean;
  };
}

// Add response processing function
export const processAIResponse = (content: string): EnhancedMessage => {
  const baseMessage: EnhancedMessage = {
    id: generateId(),
    role: "assistant",
    content,
    timestamp: Date.now(),
  };

  // Auto-detect component type
  if (/```\w+ executable/.test(content)) {
    baseMessage.componentType = "code-playground";
    baseMessage.interactionMetadata = {
      isInteractive: true,
      features: ["execution", "editing", "export"],
      exportable: true,
    };
  } else if (/\|.*\|.*\|/.test(content)) {
    baseMessage.componentType = "data-table";
    baseMessage.interactionMetadata = {
      isInteractive: true,
      features: ["sorting", "filtering", "export"],
      exportable: true,
    };
  }

  return baseMessage;
};
````

### 3.2 Update Multi-Turn Summary

Enhance your existing `components/chat/MultiTurnSummary.tsx`:

```tsx
// Add structured data parsing to your existing component
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const MultiTurnSummary = ({
  summary,
  metrics,
  className,
}: {
  summary: string;
  metrics: RelevanceMetrics;
  className?: string;
}) => {
  // Parse structured data from summary
  const parsedData = useMemo(() => {
    const lines = summary.split("\n");

    return {
      turns: extractNumber(lines, /turns?:\s*(\d+)/i) || 0,
      entities: extractArray(lines, /entities?:\s*\[(.*?)\]/i),
      topics: extractArray(lines, /topics?:\s*\[(.*?)\]/i),
      contextQuality: metrics.contextualRelevance * 100,
      relevanceScore: metrics.entityOverlap * 100,
    };
  }, [summary, metrics]);

  return (
    <Card className={cn("border-primary/20 bg-primary/5", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Brain className="w-4 h-4 text-primary" />
          Enhanced Multi-Turn Analysis
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {parsedData.turns}
            </div>
            <div className="text-xs text-muted-foreground">Turns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {parsedData.entities.length}
            </div>
            <div className="text-xs text-muted-foreground">Entities</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {parsedData.topics.length}
            </div>
            <div className="text-xs text-muted-foreground">Topics</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round(parsedData.contextQuality)}%
            </div>
            <div className="text-xs text-muted-foreground">Quality</div>
          </div>
        </div>

        {/* Quality Metrics with Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Context Relevance</span>
              <span>{Math.round(metrics.contextualRelevance * 100)}%</span>
            </div>
            <Progress
              value={metrics.contextualRelevance * 100}
              className="h-2"
            />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Entity Overlap</span>
              <span>{Math.round(metrics.entityOverlap * 100)}%</span>
            </div>
            <Progress value={metrics.entityOverlap * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Topic Continuity</span>
              <span>{Math.round(metrics.topicContinuity * 100)}%</span>
            </div>
            <Progress value={metrics.topicContinuity * 100} className="h-2" />
          </div>
        </div>

        {/* Entity and Topic Tags */}
        <div className="space-y-3">
          {parsedData.entities.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Tracked Entities</div>
              <div className="flex flex-wrap gap-1">
                {parsedData.entities.slice(0, 8).map((entity, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {entity}
                  </Badge>
                ))}
                {parsedData.entities.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{parsedData.entities.length - 8} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {parsedData.topics.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Discussion Topics</div>
              <div className="flex flex-wrap gap-1">
                {parsedData.topics.slice(0, 6).map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
                {parsedData.topics.length > 6 && (
                  <Badge variant="secondary" className="text-xs">
                    +{parsedData.topics.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Helper functions
const extractNumber = (lines: string[], pattern: RegExp): number | null => {
  const match = lines.join(" ").match(pattern);
  return match ? parseFloat(match[1]) : null;
};

const extractArray = (lines: string[], pattern: RegExp): string[] => {
  const match = lines.join(" ").match(pattern);
  return match ? match[1].split(",").map((s) => s.trim()) : [];
};
```

## Implementation Priority

### High Priority (Implement First)

1. ✅ Enhanced ChatInterface with auto-component selection
2. ✅ Enhanced ChatMessage with content detection
3. ✅ Improved MultiTurnSummary with structured data parsing
4. 🔄 CodePlayground component for interactive code
5. 🔄 InteractiveDataTable for tabular data

### Medium Priority (Week 2)

6. ⏳ Performance optimizations (virtualization, memoization)
7. ⏳ Error boundaries for robust error handling
8. ⏳ Accessibility improvements (ARIA, keyboard navigation)
9. ⏳ Advanced markdown features (math, diagrams)

### Lower Priority (Future Enhancement)

10. ⏳ Full code execution service integration
11. ⏳ Advanced data visualization components
12. ⏳ Performance monitoring and analytics
13. ⏳ Comprehensive testing suite

## Testing Your Implementation

After implementing each phase, test with these examples:

````typescript
// Test data for validation
const testCases = [
  {
    name: "Interactive Code",
    content:
      "```python executable\nprint('Hello, World!')\nfor i in range(5):\n    print(f'Count: {i}')\n```",
  },
  {
    name: "Data Table",
    content:
      "| Name | Age | City |\n|------|-----|------|\n| Alice | 30 | NYC |\n| Bob | 25 | LA |\n| Carol | 35 | Chicago |",
  },
  {
    name: "Mathematical Formula",
    content:
      "The quadratic formula: $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$",
  },
  {
    name: "Mermaid Diagram",
    content:
      "```mermaid\ngraph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Process]\n    B -->|No| D[End]\n    C --> D\n```",
  },
];
````

## Next Steps

1. **Implement Phase 1** components in your existing codebase
2. **Test each component** with the provided test cases
3. **Integrate with your existing chat pipeline**
4. **Monitor performance** and user interactions
5. **Iterate based on feedback** and usage patterns

This implementation guide provides a practical path to enhance your chat interface with advanced interactive components while maintaining compatibility with your existing agentic pipeline.
