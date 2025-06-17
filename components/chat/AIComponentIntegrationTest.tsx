"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AIEnhancedMessage } from "./AIEnhancedMessage";
import { Code, Play, RefreshCw } from "lucide-react";

// Test cases for different AI component scenarios
const TEST_CASES = [
  {
    id: "code-example",
    title: "Code Playground Test",
    description:
      "Tests automatic code detection and playground component rendering",
    content: `Here's a Python function to calculate fibonacci numbers:

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the function
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

This function uses recursion to calculate fibonacci numbers. The time complexity is O(2^n).`,
  },
  {
    id: "data-table",
    title: "Interactive Data Table Test",
    description:
      "Tests markdown table detection and interactive table component",
    content: `Here's a comparison of programming languages:

| Language | Year | Paradigm | Performance | Popularity |
|----------|------|----------|-------------|------------|
| Python | 1991 | Multi-paradigm | Medium | Very High |
| JavaScript | 1995 | Multi-paradigm | Medium | Very High |
| Rust | 2010 | Systems | Very High | High |
| Go | 2009 | Procedural | High | High |
| TypeScript | 2012 | Multi-paradigm | Medium | High |

This data shows the evolution of programming languages over time.`,
  },
  {
    id: "timeline-process",
    title: "Timeline Component Test",
    description:
      "Tests numbered step detection and timeline component rendering",
    content: `Here's how to deploy a web application:

1. **Prepare the application** - Build your application for production
2. **Set up the server** - Configure your hosting environment
3. **Deploy the code** - Upload your application files
4. **Configure the database** - Set up your data storage
5. **Test the deployment** - Verify everything works correctly
6. **Monitor the application** - Set up logging and monitoring

Each step is crucial for a successful deployment.`,
  },
  {
    id: "math-expressions",
    title: "Mathematical Expressions Test",
    description: "Tests LaTeX math detection and math renderer component",
    content: `Einstein's mass-energy equivalence formula:

$$E = mc^2$$

This equation shows that mass and energy are interchangeable. Where:
- E = energy
- m = mass
- c = speed of light in vacuum

The equation revolutionized our understanding of physics.`,
  },
  {
    id: "metrics-dashboard",
    title: "Metrics Dashboard Test",
    description: "Tests number detection and metrics dashboard component",
    content: `Performance metrics for our application:

The system achieved 99.9% uptime this month with 1,234 active users. 
Revenue increased by 15% to $45,678. Page load time averaged 2.3 seconds, 
while API response time was 150ms. Error rate stayed below 0.1%.

These metrics show strong system performance and user engagement.`,
  },
  {
    id: "progressive-disclosure",
    title: "Progressive Disclosure Test",
    description: "Tests header detection and progressive disclosure component",
    content: `# Getting Started with AI Components

## Overview
AI components automatically enhance chat responses with interactive elements based on content patterns.

## Installation
First, install the required dependencies for your project.

## Configuration
Configure the AI component system in your application settings.

## Usage Examples
Here are some practical examples of how to use AI components.

## Advanced Features
Explore advanced features like custom component directives.

## Troubleshooting
Common issues and how to resolve them.`,
  },
  {
    id: "component-directives",
    title: "Component Directives Test",
    description: "Tests explicit component directives in AI responses",
    content: `<!-- COMPONENT: CodePlayground -->
<!-- FEATURES: editable,execution -->
<!-- DATA: inline -->

Here's an interactive code example:

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("World"));
\`\`\`

<!-- COMPONENT: MetricsDashboard -->
<!-- FEATURES: progress_tracking -->

Performance summary: 95% success rate, 1200 requests processed, $5000 revenue generated.`,
  },
];

export const AIComponentIntegrationTest = () => {
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [customContent, setCustomContent] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleRunTest = (testId: string) => {
    setSelectedTest(testId);
    setIsCustomMode(false);
  };

  const handleRunCustomTest = () => {
    if (customContent.trim()) {
      setSelectedTest("custom");
      setIsCustomMode(true);
    }
  };

  const selectedTestCase = isCustomMode
    ? {
        id: "custom",
        title: "Custom Test",
        description: "User-defined test content",
        content: customContent,
      }
    : TEST_CASES.find((test) => test.id === selectedTest);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            AI Component Integration Test Suite
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test the automatic detection and rendering of interactive components
            based on AI response content.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEST_CASES.map((testCase) => (
              <Card
                key={testCase.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{testCase.title}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {testCase.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button
                    onClick={() => handleRunTest(testCase.id)}
                    size="sm"
                    className="w-full"
                    variant={
                      selectedTest === testCase.id ? "default" : "outline"
                    }
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Run Test
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Custom Test Input */}
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium">Custom Test Content</h3>
            <Textarea
              placeholder="Enter your own AI response content to test component detection..."
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              className="min-h-[120px]"
            />
            <Button
              onClick={handleRunCustomTest}
              disabled={!customContent.trim()}
              size="sm"
            >
              <Play className="w-3 h-3 mr-1" />
              Test Custom Content
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {selectedTestCase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Test Results: {selectedTestCase.title}
              </span>
              <Button
                onClick={() => setSelectedTest(null)}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {selectedTestCase.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Original Content */}
              <div>
                <h4 className="text-sm font-medium mb-2">Original Content:</h4>
                <Card className="bg-muted/30">
                  <CardContent className="p-3">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {selectedTestCase.content}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              {/* Enhanced Rendering */}
              <div>
                <h4 className="text-sm font-medium mb-2">
                  AI-Enhanced Rendering:
                </h4>
                <div className="border rounded-lg p-4 bg-background">
                  <AIEnhancedMessage
                    content={selectedTestCase.content}
                    showAnalytics={true}
                    className="bg-transparent"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Integration Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Integration Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <h4 className="font-medium">Automatic Component Detection:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                <li>Code blocks (```language) → CodePlayground component</li>
                <li>
                  Markdown tables (|header|) → InteractiveDataTable component
                </li>
                <li>Numbered lists (1. 2. 3.) → Timeline component</li>
                <li>LaTeX math ($$formula$$) → MathRenderer component</li>
                <li>
                  Numbers with units (95%, $1000) → MetricsDashboard component
                </li>
                <li>Headers (# ## ###) → ProgressiveDisclosure component</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Component Directives:</h4>
              <p className="text-muted-foreground">
                Use HTML comments to explicitly trigger components:
                <code className="ml-1 px-1 py-0.5 bg-muted rounded text-xs">
                  &lt;!-- COMPONENT: CodePlayground --&gt;
                </code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIComponentIntegrationTest;
