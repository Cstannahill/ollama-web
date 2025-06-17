// AI Component Demo Component
// This component demonstrates how AI responses can automatically trigger advanced components

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, BarChart3, Clock, Brain, Zap, Play } from "lucide-react";
import { AIEnhancedMessage } from "./AIEnhancedMessage";
import { processAIResponse } from "@/services/ai-component-selection";

interface DemoExample {
  title: string;
  description: string;
  content: string;
  expectedComponents: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const DEMO_EXAMPLES: DemoExample[] = [
  {
    title: "Code Example",
    description:
      "Shows how code blocks automatically trigger CodePlayground component",
    icon: Code,
    expectedComponents: ["CodePlayground"],
    content: `# Python Function Example

Here's a function to calculate the factorial of a number:

\`\`\`python
def factorial(n):
    """Calculate factorial using recursion."""
    if n <= 1:
        return 1
    return n * factorial(n - 1)

# Test the function
print(f"5! = {factorial(5)}")
print(f"10! = {factorial(10)}")
\`\`\`

<!-- COMPONENT: CodePlayground -->
<!-- FEATURES: syntax_highlighting,copy,execution -->
<!-- INTERACTIVE: true -->

This implementation uses recursion to calculate factorials efficiently.`,
  },
  {
    title: "Data Table Example",
    description:
      "Demonstrates automatic InteractiveDataTable component for tabular data",
    icon: BarChart3,
    expectedComponents: ["InteractiveDataTable"],
    content: `# Performance Comparison Results

Here are the benchmark results for different sorting algorithms:

| Algorithm | Best Case | Average Case | Worst Case | Space Complexity |
|-----------|-----------|--------------|------------|------------------|
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) |

<!-- COMPONENT: InteractiveDataTable -->
<!-- FEATURES: sorting,filtering,export,charts -->
<!-- INTERACTIVE: true -->

Quick Sort performs best on average, while Merge Sort guarantees consistent O(n log n) performance.`,
  },
  {
    title: "Process Timeline",
    description: "Shows how numbered processes trigger Timeline component",
    icon: Clock,
    expectedComponents: ["Timeline"],
    content: `# Machine Learning Project Timeline

## Implementation Process

1. **Data Collection** (Week 1)
   - Gather training datasets from multiple sources
   - Clean and validate data quality
   - Set up data storage infrastructure

2. **Data Preprocessing** (Week 2)
   - Handle missing values and outliers
   - Feature engineering and selection
   - Data normalization and scaling

3. **Model Development** (Week 3-4)
   - Experiment with different algorithms
   - Hyperparameter tuning and optimization
   - Cross-validation and performance evaluation

4. **Model Deployment** (Week 5)
   - Set up production environment
   - Implement monitoring and logging
   - Deploy model with API endpoints

5. **Testing & Validation** (Week 6)
   - A/B testing with real users
   - Performance monitoring and optimization
   - Documentation and knowledge transfer

<!-- COMPONENT: Timeline -->
<!-- FEATURES: interactive_steps,progress_tracking,time_estimates -->
<!-- INTERACTIVE: true -->

This timeline ensures systematic development and deployment of ML models.`,
  },
  {
    title: "Complex Guide",
    description: "Demonstrates ProgressiveDisclosure for long-form content",
    icon: Brain,
    expectedComponents: ["ProgressiveDisclosure"],
    content: `# Complete Guide to React Hooks

## Quick Summary
React Hooks allow you to use state and lifecycle features in functional components, making code more reusable and easier to test.

## Introduction to Hooks
React Hooks were introduced in React 16.8 as a way to add state and lifecycle methods to functional components. They provide a more direct API to the React concepts you already know: props, state, context, refs, and lifecycle.

## Core Hooks

### useState Hook
The useState hook allows you to add state to functional components. It returns an array with two elements: the current state value and a setter function.

### useEffect Hook
The useEffect hook lets you perform side effects in functional components. It serves the same purpose as componentDidMount, componentDidUpdate, and componentWillUnmount combined.

### useContext Hook
The useContext hook allows you to consume React context without wrapping your component in a Consumer.

## Advanced Hooks

### useReducer Hook
For complex state logic, useReducer is an alternative to useState. It's particularly useful when you have complex state logic that involves multiple sub-values.

### useMemo and useCallback
These hooks help optimize performance by memoizing expensive calculations and function definitions.

### Custom Hooks
Custom hooks allow you to extract component logic into reusable functions. They're a mechanism to reuse stateful logic between components.

## Best Practices and Common Patterns

### Rules of Hooks
- Always call hooks at the top level of your function
- Don't call hooks inside loops, conditions, or nested functions
- Only call hooks from React function components or custom hooks

### Performance Optimization
- Use useMemo for expensive calculations
- Use useCallback for function dependencies
- Avoid unnecessary re-renders with React.memo

### Testing Hooks
- Use React Testing Library for testing components with hooks
- Create custom render functions for providers
- Test behavior, not implementation details

<!-- COMPONENT: ProgressiveDisclosure -->
<!-- FEATURES: expandable_sections,structured_navigation,bookmarks -->
<!-- INTERACTIVE: true -->

This comprehensive guide covers everything you need to know about React Hooks.`,
  },
  {
    title: "Multi-Component Response",
    description: "Shows how complex responses can trigger multiple components",
    icon: Zap,
    expectedComponents: ["CodePlayground", "InteractiveDataTable", "Timeline"],
    content: `# Full-Stack Web Development Tutorial

## Project Overview
Build a complete task management application with React frontend and Node.js backend.

## Development Process

1. **Environment Setup** (Day 1)
   - Install Node.js and npm
   - Create React application
   - Set up development tools

2. **Backend Development** (Day 2-3)
   - Create Express.js server
   - Set up MongoDB database
   - Implement REST API endpoints

3. **Frontend Development** (Day 4-5)
   - Design component architecture
   - Implement user interface
   - Connect to backend API

4. **Testing & Deployment** (Day 6)
   - Write unit and integration tests
   - Deploy to production
   - Set up monitoring

<!-- COMPONENT: Timeline -->
<!-- FEATURES: interactive_steps,progress_tracking -->
<!-- INTERACTIVE: true -->

## Sample Backend Code

\`\`\`javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
\`\`\`

<!-- COMPONENT: CodePlayground -->
<!-- FEATURES: syntax_highlighting,copy,execution -->
<!-- INTERACTIVE: true -->

## Performance Metrics

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Load Time | < 2s | 1.3s | ✅ Pass |
| Bundle Size | < 500KB | 420KB | ✅ Pass |
| Lighthouse Score | > 90 | 95 | ✅ Pass |
| API Response | < 200ms | 150ms | ✅ Pass |

<!-- COMPONENT: InteractiveDataTable -->
<!-- FEATURES: sorting,filtering,export -->
<!-- INTERACTIVE: true -->

This tutorial demonstrates a complete development workflow with multiple interactive components.`,
  },
];

export const AIComponentDemo = () => {
  const [selectedExample, setSelectedExample] = useState<DemoExample>(
    DEMO_EXAMPLES[0]
  );
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const analyzeExample = (example: DemoExample) => {
    const result = processAIResponse(example.content);
    setAnalysisResult(result);
    setSelectedExample(example);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Component Integration Demo
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This demo shows how AI responses automatically trigger advanced
            interactive components based on content patterns and directives.
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="examples" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="examples" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_EXAMPLES.map((example, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <example.icon className="w-4 h-4" />
                    {example.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">
                    {example.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {example.expectedComponents.map((component) => (
                      <Badge
                        key={component}
                        variant="outline"
                        className="text-xs"
                      >
                        {component}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => analyzeExample(example)}
                    className="w-full"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Analyze
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedExample && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedExample.icon className="w-4 h-4" />
                  {selectedExample.title} - Enhanced Output
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AIEnhancedMessage
                  content={selectedExample.content}
                  showAnalytics={true}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {analysisResult && (
            <Card>
              <CardHeader>
                <CardTitle>Content Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium">Quality Score</div>
                    <div className="text-2xl font-bold text-green-600">
                      {analysisResult.qualityScore}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Components</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {analysisResult.components.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Word Count</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {analysisResult.metadata.analysis.wordCount}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Complexity</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {analysisResult.metadata.analysis.complexity}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Detected Components:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.components.map(
                        (component: any, index: number) => (
                          <Badge key={index} variant="secondary">
                            {component.type}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Content Features:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.metadata.analysis.hasCode && (
                        <Badge variant="outline">Code</Badge>
                      )}
                      {analysisResult.metadata.analysis.hasData && (
                        <Badge variant="outline">Data</Badge>
                      )}
                      {analysisResult.metadata.analysis.hasMath && (
                        <Badge variant="outline">Math</Badge>
                      )}
                      {analysisResult.metadata.analysis.hasProcess && (
                        <Badge variant="outline">Process</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIComponentDemo;
