# AI Component Selection & Prompting Guide

## Overview

This guide provides comprehensive instructions for AI systems on when and how to utilize advanced chat components. It includes detection patterns, component selection criteria, and structured response formatting to ensure optimal user experience.

## Component Detection & Selection Matrix

### 1. Content Pattern Recognition

````typescript
// AI Decision Tree for Component Selection
interface ComponentDecisionTree {
  // Code-related content
  codePatterns: {
    triggers: ["```", "function", "class", "import", "def", "const", "let"];
    component: "CodePlayground";
    features: ["syntax highlighting", "execution", "copy", "download"];
  };

  // Data visualization content
  dataPatterns: {
    triggers: [
      "table",
      "chart",
      "graph",
      "data analysis",
      "metrics",
      "statistics",
    ];
    component: "InteractiveDataTable" | "MetricsDashboard";
    features: ["sorting", "filtering", "export", "visualization"];
  };

  // Mathematical content
  mathPatterns: {
    triggers: ["$$", "\\(", "formula", "equation", "theorem", "proof"];
    component: "MathRenderer";
    features: ["LaTeX", "interactive graphs", "step-by-step"];
  };

  // Workflow/Process content
  processPatterns: {
    triggers: ["workflow", "steps", "process", "timeline", "sequence"];
    component: "Timeline" | "ProcessViewer";
    features: ["interactive steps", "progress tracking", "branching"];
  };

  // Summary/Analysis content
  summaryPatterns: {
    triggers: ["summary", "analysis", "overview", "key points", "conclusions"];
    component: "ProgressiveDisclosure" | "MultiTurnSummary";
    features: ["expandable sections", "structured data", "metrics"];
  };
}
````

### 2. Response Type Classification

```typescript
// AI Response Classification System
export const classifyResponse = (
  content: string,
  context: ChatContext
): ResponseClassification => {
  return {
    primary: detectPrimaryType(content),
    secondary: detectSecondaryTypes(content),
    complexity: assessComplexity(content),
    interactivity: assessInteractivityNeeds(content),
    visualization: assessVisualizationNeeds(content),
    components: selectOptimalComponents(content, context),
  };
};

interface ResponseClassification {
  primary: "code" | "data" | "text" | "math" | "process" | "summary";
  secondary: string[];
  complexity: "simple" | "moderate" | "complex";
  interactivity: "none" | "basic" | "advanced";
  visualization: "none" | "charts" | "diagrams" | "tables";
  components: ComponentSelection[];
}
```

## AI Prompting Instructions

### 1. Content Structure Guidelines

When generating responses, the AI should follow this structure:

````markdown
# Response Structure Template

## Primary Content

[Main response content with appropriate markdown formatting]

## Structured Data (if applicable)

```json
{
  "type": "data_analysis",
  "metrics": {
    "accuracy": 95.2,
    "processing_time": "1.2s",
    "confidence": 0.89
  },
  "entities": ["entity1", "entity2"],
  "topics": ["topic1", "topic2"]
}
```
````

## Component Directives

<!-- COMPONENT: InteractiveDataTable -->
<!-- DATA: metrics.json -->
<!-- FEATURES: sorting,filtering,export -->

## Interactive Elements (if applicable)

[Code blocks, formulas, or interactive content]

```

### 2. Component Selection Prompts

#### For Code-Related Responses:
```

WHEN: User asks about programming, scripts, algorithms, or shows code
USE: CodePlayground component
FORMAT: Wrap code in ``` blocks with language specification
FEATURES: Enable syntax highlighting, copy button, and execution if safe
EXAMPLE:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

<!-- COMPONENT: CodePlayground -->
<!-- LANGUAGE: python -->
<!-- FEATURES: execution,copy,download -->

```

#### For Data Analysis Responses:
```

WHEN: User requests data analysis, comparisons, or statistical information
USE: InteractiveDataTable or MetricsDashboard
FORMAT: Provide data in structured format + summary
FEATURES: Enable sorting, filtering, export capabilities
EXAMPLE:
Analysis shows significant improvement across key metrics:

| Metric   | Before | After | Change |
| -------- | ------ | ----- | ------ |
| Speed    | 100ms  | 50ms  | +100%  |
| Accuracy | 85%    | 95%   | +11.8% |

<!-- COMPONENT: InteractiveDataTable -->
<!-- DATA: performance_metrics -->
<!-- FEATURES: sorting,filtering,export,charts -->

```

#### For Process/Workflow Responses:
```

WHEN: User asks about processes, workflows, or step-by-step procedures
USE: Timeline or ProcessViewer component
FORMAT: Structure as sequential steps with metadata
FEATURES: Enable progress tracking, interactive steps
EXAMPLE:

## Machine Learning Pipeline

1. **Data Collection** (5 min)
   - Gather training data
   - Validate data quality
2. **Preprocessing** (10 min)

   - Clean and normalize data
   - Feature engineering

3. **Model Training** (30 min)
   - Train multiple models
   - Cross-validation

<!-- COMPONENT: Timeline -->
<!-- TYPE: process -->
<!-- FEATURES: progress_tracking,interactive_steps -->

```

#### For Summary/Analysis Responses:
```

WHEN: User requests summaries, analysis, or multi-turn conversation insights
USE: ProgressiveDisclosure or MultiTurnSummary
FORMAT: Provide summary with expandable details
FEATURES: Enable structured data parsing, metrics display
EXAMPLE:

## Conversation Analysis Summary

**Key Insights**: 3 main topics discussed across 5 turns
**Entities Identified**: 8 unique entities tracked
**Context Quality**: 94% relevance score

<!-- COMPONENT: MultiTurnSummary -->
<!-- TURNS: 5 -->
<!-- ENTITIES: ["machine learning", "data preprocessing", "model evaluation"] -->
<!-- TOPICS: ["data science", "automation", "performance"] -->

```

### 3. Advanced Component Integration

#### Mathematical Content:
```

WHEN: Response contains formulas, equations, or mathematical concepts
USE: MathRenderer with LaTeX support
FORMAT: Use $$ for block math, $ for inline math
FEATURES: Interactive graphs, step-by-step solutions

Einstein's mass-energy equivalence:
$$E = mc^2$$

Where:

- $E$ = energy
- $m$ = mass
- $c$ = speed of light

<!-- COMPONENT: MathRenderer -->
<!-- FEATURES: interactive,step_by_step,graphing -->

```

#### Complex Multi-Component Responses:
```

WHEN: Response needs multiple component types
USE: Combination of components with clear separation
FORMAT: Use component directives to specify each section

## Analysis Results

### Summary

[Main findings and conclusions]

### Data Breakdown

[Interactive table with detailed metrics]

<!-- COMPONENT: InteractiveDataTable -->

### Implementation Code

```python
# Implementation example
```

<!-- COMPONENT: CodePlayground -->

### Process Flow

[Step-by-step workflow]

<!-- COMPONENT: Timeline -->

````

## AI Response Enhancement Pipeline

### 1. Content Analysis Phase
```typescript
// AI should analyze content for these patterns
const analyzeContent = (response: string) => {
  return {
    hasCode: /```[\s\S]*?```/.test(response),
    hasData: /\|.*\|.*\|/.test(response) || /\d+\.\d+%/.test(response),
    hasMath: /\$\$[\s\S]*?\$\$/.test(response),
    hasProcess: /\d+\.\s+\*\*/.test(response),
    hasStructuredData: /\{[\s\S]*?\}/.test(response),
    complexity: assessComplexity(response),
    wordCount: response.split(' ').length
  };
};
````

### 2. Component Selection Logic

```typescript
// AI decision logic for component selection
const selectComponents = (analysis: ContentAnalysis) => {
  const components = [];

  if (analysis.hasCode) {
    components.push({
      type: "CodePlayground",
      priority: 1,
      features: ["syntax_highlighting", "copy", "execution"],
    });
  }

  if (analysis.hasData) {
    components.push({
      type: "InteractiveDataTable",
      priority: 2,
      features: ["sorting", "filtering", "export"],
    });
  }

  if (analysis.complexity === "high" || analysis.wordCount > 500) {
    components.push({
      type: "ProgressiveDisclosure",
      priority: 3,
      features: ["expandable_sections", "structured_navigation"],
    });
  }

  return components.sort((a, b) => a.priority - b.priority);
};
```

### 3. Response Formatting Guidelines

#### Component Directive Syntax:

```html
<!-- COMPONENT: ComponentName -->
<!-- FEATURES: feature1,feature2,feature3 -->
<!-- DATA: optional_data_reference -->
<!-- PRIORITY: 1-5 -->
<!-- INTERACTIVE: true/false -->
```

#### Structured Data Embedding:

```json
{
  "component_metadata": {
    "type": "data_visualization",
    "data_source": "analysis_results",
    "interactive_features": ["sorting", "filtering", "export"],
    "visualization_type": "table_with_charts"
  },
  "content_structure": {
    "sections": [
      { "type": "summary", "component": "ProgressiveDisclosure" },
      { "type": "data", "component": "InteractiveDataTable" },
      { "type": "code", "component": "CodePlayground" }
    ]
  }
}
```

## Response Quality Metrics

### 1. Component Utilization Scoring

```typescript
interface ResponseQuality {
  componentUtilization: number; // 0-100%
  interactivityLevel: "none" | "basic" | "advanced";
  userEngagement: number; // Predicted engagement score
  accessibilityCompliance: number; // A11y score
  performanceImpact: "low" | "medium" | "high";
}

// Quality assessment criteria
const assessResponseQuality = (response: EnhancedResponse) => {
  return {
    componentUtilization: calculateComponentUsage(response),
    interactivityLevel: assessInteractivity(response),
    userEngagement: predictEngagement(response),
    accessibilityCompliance: checkAccessibility(response),
    performanceImpact: assessPerformance(response),
  };
};
```

### 2. Optimization Guidelines

#### Performance Considerations:

- Use progressive loading for responses > 1000 words
- Implement virtualization for tables > 100 rows
- Lazy load interactive components
- Cache component configurations

#### Accessibility Requirements:

- Include ARIA labels for all interactive elements
- Provide keyboard navigation support
- Ensure proper heading hierarchy
- Add alt text for visual components

#### User Experience Priorities:

- Prioritize most relevant component first
- Provide clear visual hierarchy
- Enable easy content export
- Support mobile responsiveness

## Implementation Examples

### Example 1: Code Analysis Response

````markdown
# Code Review Results

## Summary

Your Python function shows good structure but has optimization opportunities.

## Code Analysis

```python
def process_data(data):
    # Original code with annotations
    results = []
    for item in data:  # Consider using list comprehension
        if item > 0:
            results.append(item * 2)
    return results

# Optimized version
def process_data_optimized(data):
    return [item * 2 for item in data if item > 0]
```
````

<!-- COMPONENT: CodePlayground -->
<!-- LANGUAGE: python -->
<!-- FEATURES: execution,comparison,performance_metrics -->

## Performance Metrics

| Metric | Original | Optimized | Improvement |
| ------ | -------- | --------- | ----------- |
| Speed  | 100ms    | 45ms      | 55%         |
| Memory | 1.2MB    | 0.8MB     | 33%         |

<!-- COMPONENT: InteractiveDataTable -->
<!-- DATA: performance_comparison -->
<!-- FEATURES: sorting,charts,export -->

````

### Example 2: Data Analysis Response
```markdown
# Sales Analysis Report

## Executive Summary
Q4 sales exceeded targets by 15% with strong performance across all regions.

<!-- COMPONENT: ProgressiveDisclosure -->
<!-- SECTIONS: executive_summary,detailed_analysis,recommendations -->

## Key Metrics Dashboard
<!-- COMPONENT: MetricsDashboard -->
<!-- METRICS: revenue,growth,regional_performance -->

## Detailed Breakdown
<!-- COMPONENT: InteractiveDataTable -->
<!-- DATA: sales_data -->
<!-- FEATURES: sorting,filtering,export,charts -->

## Growth Trend Analysis
<!-- COMPONENT: Timeline -->
<!-- TYPE: performance_timeline -->
<!-- INTERACTIVE: true -->
````

### Example 3: Multi-Turn Conversation Summary

```markdown
# Conversation Analysis

## Summary Statistics

**Turns Analyzed**: 8 turns
**Key Entities**: 12 entities tracked
**Topics Covered**: 4 main discussion areas
**Context Quality**: 92% relevance

<!-- COMPONENT: MultiTurnSummary -->
<!-- TURNS: 8 -->
<!-- ENTITIES: ["machine learning", "data analysis", "Python", "optimization"] -->
<!-- TOPICS: ["performance", "best practices", "implementation", "testing"] -->
<!-- QUALITY_SCORE: 0.92 -->

## Detailed Analysis

[Expandable detailed breakdown of conversation flow]

<!-- COMPONENT: ProgressiveDisclosure -->
<!-- SECTIONS: entity_tracking,topic_flow,context_analysis -->
```

## Integration Instructions for Developers

### 1. Component Registration

```typescript
// Register components with the AI response system
export const registerAIComponents = () => {
  registerComponent("CodePlayground", CodePlayground);
  registerComponent("InteractiveDataTable", InteractiveDataTable);
  registerComponent("MetricsDashboard", MetricsDashboard);
  registerComponent("Timeline", Timeline);
  registerComponent("ProgressiveDisclosure", ProgressiveDisclosure);
  registerComponent("MultiTurnSummary", MultiTurnSummary);
  registerComponent("MathRenderer", MathRenderer);
};
```

### 2. Response Processing Pipeline

```typescript
// AI response processing pipeline
export const processAIResponse = async (
  rawResponse: string
): Promise<EnhancedResponse> => {
  // 1. Parse component directives
  const directives = parseComponentDirectives(rawResponse);

  // 2. Extract structured data
  const structuredData = extractStructuredData(rawResponse);

  // 3. Select and configure components
  const components = await configureComponents(directives, structuredData);

  // 4. Optimize for performance
  const optimizedResponse = optimizeResponse(rawResponse, components);

  return {
    content: optimizedResponse.content,
    components: optimizedResponse.components,
    metadata: optimizedResponse.metadata,
    qualityScore: assessQuality(optimizedResponse),
  };
};
```

### 3. Quality Assurance

```typescript
// Response quality validation
export const validateResponse = (
  response: EnhancedResponse
): ValidationResult => {
  const checks = [
    validateComponentCompatibility(response.components),
    validateAccessibilityCompliance(response),
    validatePerformanceImpact(response),
    validateUserExperience(response),
  ];

  return {
    passed: checks.every((check) => check.passed),
    warnings: checks.flatMap((check) => check.warnings),
    suggestions: generateImprovementSuggestions(checks),
  };
};
```

This comprehensive guide ensures AI systems can intelligently select and utilize advanced chat components to provide the best possible user experience.
