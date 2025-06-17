# AI Component Integration Instructions

## Overview

This document provides comprehensive instructions for AI systems on how to structure responses to automatically trigger advanced chat components. When the AI generates responses that follow these patterns, the system will automatically detect and render appropriate interactive components.

## Component Directive System

### Basic Directive Format

```html
<!-- COMPONENT: ComponentName -->
<!-- FEATURES: feature1,feature2,feature3 -->
<!-- INTERACTIVE: true/false -->
<!-- PRIORITY: 1-5 -->
```

### Component Types Available

#### 1. Code Playground

**When to Use**: Any response containing code examples, programming tutorials, or executable scripts.

**Trigger Patterns**:

- Code blocks with ``` syntax
- Programming keywords: function, class, import, def, const, let, var
- Language names: python, javascript, typescript, java, etc.

**Implementation**:

````markdown
Here's a Python function to calculate fibonacci numbers:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Test the function
print(fibonacci(10))
```
````

<!-- COMPONENT: CodePlayground -->
<!-- FEATURES: syntax_highlighting,copy,execution -->
<!-- INTERACTIVE: true -->

````

#### 2. Interactive Data Table
**When to Use**: Responses with tabular data, comparisons, metrics, or structured information.

**Trigger Patterns**:
- Markdown tables (| header | format |)
- Data analysis results
- Comparison charts
- Statistical information

**Implementation**:
```markdown
Here's a comparison of performance metrics:

| Algorithm | Time Complexity | Space Complexity | Best Case |
|-----------|----------------|------------------|-----------|
| Bubble Sort | O(n²) | O(1) | O(n) |
| Quick Sort | O(n log n) | O(log n) | O(n log n) |
| Merge Sort | O(n log n) | O(n) | O(n log n) |

<!-- COMPONENT: InteractiveDataTable -->
<!-- FEATURES: sorting,filtering,export,charts -->
<!-- INTERACTIVE: true -->
````

#### 3. Timeline/Process Viewer

**When to Use**: Step-by-step processes, workflows, timelines, or sequential procedures.

**Trigger Patterns**:

- Numbered lists with process steps
- Sequential workflows
- Time-based events
- Installation guides

**Implementation**:

```markdown
## Machine Learning Pipeline Process

1. **Data Collection** (Day 1-2)

   - Gather training datasets
   - Validate data quality
   - Clean and preprocess

2. **Model Training** (Day 3-5)

   - Split data into train/test sets
   - Train multiple algorithms
   - Perform cross-validation

3. **Evaluation** (Day 6)

   - Compare model performance
   - Generate metrics reports
   - Select best performing model

4. **Deployment** (Day 7)
   - Deploy to production
   - Set up monitoring
   - Create documentation

<!-- COMPONENT: Timeline -->
<!-- FEATURES: interactive_steps,progress_tracking,time_estimates -->
<!-- INTERACTIVE: true -->
```

#### 4. Progressive Disclosure

**When to Use**: Long responses, detailed explanations, or content that benefits from expandable sections.

**Trigger Patterns**:

- Responses longer than 500 words
- Multiple distinct sections
- Detailed tutorials or guides
- FAQ-style content

**Implementation**:

```markdown
# Complete Guide to React Hooks

## Quick Summary

React Hooks allow you to use state and lifecycle features in functional components. The most common hooks are useState, useEffect, and useContext.

## Detailed Explanation

### useState Hook

The useState hook allows you to add state to functional components...

### useEffect Hook

The useEffect hook lets you perform side effects in functional components...

### Custom Hooks

You can create your own hooks to share stateful logic between components...

### Best Practices

- Always call hooks at the top level
- Use dependency arrays correctly
- Clean up side effects properly

<!-- COMPONENT: ProgressiveDisclosure -->
<!-- FEATURES: expandable_sections,structured_navigation,bookmarks -->
<!-- INTERACTIVE: true -->
```

#### 5. Math Renderer

**When to Use**: Mathematical formulas, equations, scientific notation, or complex calculations.

**Trigger Patterns**:

- LaTeX syntax with $$ or $
- Mathematical terms: equation, formula, theorem, proof
- Scientific calculations
- Statistical formulas

**Implementation**:

```markdown
## Quadratic Formula Explanation

The quadratic formula is used to solve quadratic equations of the form ax² + bx + c = 0:

$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$

Where:

- $a$, $b$, and $c$ are coefficients
- $x$ represents the solutions
- The discriminant $\Delta = b^2 - 4ac$ determines the nature of roots

Example: For the equation $2x^2 + 5x - 3 = 0$:
$$x = \frac{-5 \pm \sqrt{25 + 24}}{4} = \frac{-5 \pm 7}{4}$$

So $x_1 = 0.5$ and $x_2 = -3$

<!-- COMPONENT: MathRenderer -->
<!-- FEATURES: latex,interactive_graphs,step_by_step -->
<!-- INTERACTIVE: true -->
```

#### 6. Multi-Turn Summary

**When to Use**: Conversation analysis, context summaries, or multi-turn dialogue insights.

**Trigger Patterns**:

- Conversation analysis requests
- Summary of previous interactions
- Context review needs
- Multi-turn dialogue patterns

**Implementation**:

```markdown
# Conversation Analysis Summary

## Overview

This conversation covered 3 main topics across 8 turns with high context relevance.

**Key Statistics**:

- Turns Analyzed: 8
- Entities Tracked: 12 unique entities
- Topics Covered: 3 main areas
- Context Quality: 94% relevance score

**Main Entities**: machine learning, data preprocessing, model evaluation, Python, scikit-learn, pandas, neural networks, deep learning

**Discussion Topics**:

1. Data preprocessing techniques
2. Model selection strategies
3. Performance optimization

<!-- COMPONENT: MultiTurnSummary -->
<!-- TURNS: 8 -->
<!-- ENTITIES: ["machine learning", "data preprocessing", "model evaluation"] -->
<!-- TOPICS: ["data science", "optimization", "best practices"] -->
<!-- QUALITY_SCORE: 0.94 -->
```

## Auto-Detection Rules

The system automatically detects content patterns and applies components even without explicit directives:

### 1. Code Detection

````typescript
// Auto-detected patterns:
const codePatterns = [
  /```[\s\S]*?```/g, // Code blocks
  /function\s+\w+/g, // Function definitions
  /class\s+\w+/g, // Class definitions
  /import\s+.*from/g, // Import statements
  /def\s+\w+/g, // Python functions
  /const\s+\w+\s*=/g, // JavaScript constants
];
````

### 2. Data Table Detection

```typescript
// Auto-detected patterns:
const tablePatterns = [
  /\|.*\|.*\|/g, // Markdown tables
  /\d+\.\d+%/g, // Percentage values
  /\$[\d,]+/g, // Currency values
  /\d+\s*(ms|sec|min|hour)/g, // Time measurements
];
```

### 3. Process Detection

```typescript
// Auto-detected patterns:
const processPatterns = [
  /\d+\.\s+\*\*/g, // Numbered steps with bold
  /Step\s+\d+:/g, // Step indicators
  /Phase\s+\d+/g, // Phase indicators
  /\d+\)\s+[A-Z]/g, // Numbered list items
];
```

## Response Enhancement Guidelines

### Quality Scoring Factors

1. **Component Utilization** (30 points)

   - Use appropriate components for content type
   - Enable interactive features when beneficial
   - Provide fallbacks for accessibility

2. **Content Structure** (25 points)

   - Clear headings and sections
   - Logical information hierarchy
   - Proper markdown formatting

3. **Interactivity** (20 points)

   - Enable user interaction where valuable
   - Provide copy/export functionality
   - Support keyboard navigation

4. **Accessibility** (15 points)

   - Include ARIA labels
   - Support screen readers
   - Ensure keyboard accessibility

5. **Performance** (10 points)
   - Optimize for large datasets
   - Use progressive loading
   - Minimize rendering overhead

### Best Practices for AI Responses

#### 1. Structure for Scannability

```markdown
# Main Topic

## Quick Summary

Brief overview for users who want key points quickly.

## Detailed Explanation

Comprehensive information for users who need depth.

## Examples

Practical examples with code or data.

## Next Steps

Clear action items or follow-up suggestions.
```

#### 2. Use Progressive Disclosure

```markdown
# Complex Topic Guide

## Overview

High-level summary (always visible)

## Fundamentals

Basic concepts (expandable)

## Advanced Concepts

Detailed explanations (expandable)

## Implementation Details

Technical specifications (expandable)

## Troubleshooting

Common issues and solutions (expandable)
```

#### 3. Enhance with Interactive Elements

```markdown
# Data Analysis Results

## Summary Dashboard

<!-- COMPONENT: MetricsDashboard -->

## Raw Data

<!-- COMPONENT: InteractiveDataTable -->

## Implementation Code

<!-- COMPONENT: CodePlayground -->

## Process Timeline

<!-- COMPONENT: Timeline -->
```

## Integration Examples

### Example 1: Programming Tutorial Response

````markdown
# Building a REST API with FastAPI

## Quick Start

Here's a minimal FastAPI application to get you started:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: str = None):
    return {"item_id": item_id, "q": q}
```
````

<!-- COMPONENT: CodePlayground -->
<!-- FEATURES: syntax_highlighting,copy,execution -->
<!-- INTERACTIVE: true -->

## Implementation Steps

1. **Setup Environment** (5 min)

   - Install Python 3.7+
   - Create virtual environment
   - Install FastAPI and Uvicorn

2. **Create Basic App** (10 min)

   - Define FastAPI instance
   - Create route handlers
   - Add request/response models

3. **Add Database** (15 min)

   - Setup SQLAlchemy
   - Define database models
   - Create CRUD operations

4. **Testing & Deployment** (20 min)
   - Write unit tests
   - Configure for production
   - Deploy to cloud platform

<!-- COMPONENT: Timeline -->
<!-- FEATURES: interactive_steps,time_estimates,checklist -->
<!-- INTERACTIVE: true -->

## Performance Comparison

| Framework | Requests/sec | Memory Usage | Startup Time |
| --------- | ------------ | ------------ | ------------ |
| FastAPI   | 65,000       | 45MB         | 0.8s         |
| Flask     | 35,000       | 32MB         | 0.5s         |
| Django    | 25,000       | 78MB         | 1.2s         |

<!-- COMPONENT: InteractiveDataTable -->
<!-- FEATURES: sorting,filtering,charts,export -->
<!-- INTERACTIVE: true -->

````

### Example 2: Data Analysis Response
```markdown
# Sales Performance Analysis Q4 2024

## Executive Summary
Q4 showed exceptional growth with 34% increase in revenue and 28% improvement in conversion rates across all channels.

<!-- COMPONENT: ProgressiveDisclosure -->
<!-- SECTIONS: summary,detailed_analysis,recommendations -->

## Key Metrics Dashboard

| Metric | Q3 2024 | Q4 2024 | Change | Target |
|--------|---------|---------|--------|--------|
| Revenue | $2.4M | $3.2M | +34% | $3.0M ✓ |
| Conversion Rate | 3.2% | 4.1% | +28% | 4.0% ✓ |
| Customer Acquisition | 1,200 | 1,650 | +38% | 1,500 ✓ |
| Average Order Value | $285 | $312 | +9% | $300 ✓ |

<!-- COMPONENT: InteractiveDataTable -->
<!-- FEATURES: sorting,filtering,export,charts -->
<!-- INTERACTIVE: true -->

## Analysis Implementation

```python
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Load and analyze sales data
def analyze_quarterly_performance(data_file):
    df = pd.read_csv(data_file)

    # Calculate key metrics
    revenue_growth = df.groupby('quarter')['revenue'].sum().pct_change()
    conversion_rates = df.groupby('quarter')['conversions'].sum() / df.groupby('quarter')['visits'].sum()

    return {
        'revenue_growth': revenue_growth,
        'conversion_rates': conversion_rates,
        'summary_stats': df.describe()
    }

# Generate insights
results = analyze_quarterly_performance('sales_q4_2024.csv')
print(f"Revenue growth: {results['revenue_growth'].iloc[-1]:.1%}")
````

<!-- COMPONENT: CodePlayground -->
<!-- FEATURES: syntax_highlighting,copy,execution,data_visualization -->
<!-- INTERACTIVE: true -->

````

## Prompt Engineering for Components

### AI System Instructions
When generating responses, always consider:

1. **Content Analysis**: Analyze the user's question to determine what type of response would be most helpful
2. **Component Selection**: Choose components that enhance understanding and engagement
3. **Progressive Enhancement**: Start with basic content, then add interactive elements
4. **Accessibility**: Ensure components are accessible to all users
5. **Performance**: Consider the impact of components on page load and rendering

### Response Template
```markdown
# [Main Topic]

## [Quick Summary]
[Brief overview - always include]

[Main content with appropriate markdown formatting]

<!-- Add component directives based on content type -->
<!-- COMPONENT: [ComponentName] -->
<!-- FEATURES: [relevant_features] -->
<!-- INTERACTIVE: true -->

## [Additional Sections as needed]
[More detailed content if required]

<!-- Additional components if content warrants -->
````

This system ensures that AI responses are automatically enhanced with the most appropriate interactive components, providing users with rich, engaging, and accessible content experiences.
