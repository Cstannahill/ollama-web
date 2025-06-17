// AI Component Selection Service
// This service analyzes AI responses and automatically selects appropriate components

export interface ComponentDirective {
  type: string;
  features?: string[];
  data?: string;
  priority?: number;
  interactive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface ResponseAnalysis {
  hasCode: boolean;
  hasData: boolean;
  hasMath: boolean;
  hasProcess: boolean;
  hasStructuredData: boolean;
  complexity: "simple" | "moderate" | "complex";
  wordCount: number;
  componentDirectives: ComponentDirective[];
}

export interface EnhancedAIResponse {
  content: string;
  components: ComponentDirective[];
  metadata: Record<string, unknown>;
  qualityScore: number;
}

// Content pattern detection
export const analyzeResponseContent = (content: string): ResponseAnalysis => {
  const codePattern = /```[\s\S]*?```/g;
  const dataPattern = /\|.*\|.*\|/g;
  const mathPattern = /\$\$[\s\S]*?\$\$/g;
  const processPattern = /\d+\.\s+\*\*/g;
  const structuredDataPattern = /```json[\s\S]*?```/g;
  const componentDirectivePattern = /<!-- COMPONENT: (\w+) -->/g;

  const wordCount = content.split(/\s+/).length;
  const complexity =
    wordCount > 1000 ? "complex" : wordCount > 300 ? "moderate" : "simple";

  // Extract component directives from content
  const directives: ComponentDirective[] = [];
  let match;

  while ((match = componentDirectivePattern.exec(content)) !== null) {
    const type = match[1];

    // Extract features, data, and other attributes
    const features =
      extractDirectiveAttribute(content, match.index, "FEATURES")?.split(",") ||
      [];
    const data = extractDirectiveAttribute(content, match.index, "DATA");
    const priorityStr = extractDirectiveAttribute(
      content,
      match.index,
      "PRIORITY"
    );
    const priority = priorityStr ? parseInt(priorityStr) : 1;
    const interactive =
      extractDirectiveAttribute(content, match.index, "INTERACTIVE") === "true";

    directives.push({
      type,
      features,
      data: data || undefined,
      priority,
      interactive,
    });
  }

  return {
    hasCode: codePattern.test(content),
    hasData: dataPattern.test(content),
    hasMath: mathPattern.test(content),
    hasProcess: processPattern.test(content),
    hasStructuredData: structuredDataPattern.test(content),
    complexity,
    wordCount,
    componentDirectives: directives,
  };
};

// Helper function to extract directive attributes
const extractDirectiveAttribute = (
  content: string,
  startIndex: number,
  attribute: string
): string | null => {
  const attributePattern = new RegExp(`<!-- ${attribute}: ([^-]+) -->`);
  const endIndex = content.indexOf("-->", startIndex + 100); // Look in next 100 chars for end
  const section = content.substring(startIndex, endIndex + 3);
  const match = section.match(attributePattern);
  return match ? match[1].trim() : null;
};

// Auto-select components based on content analysis
export const selectOptimalComponents = (
  analysis: ResponseAnalysis
): ComponentDirective[] => {
  const components: ComponentDirective[] = [...analysis.componentDirectives];

  // If no explicit directives, auto-detect based on content patterns
  if (components.length === 0) {
    if (analysis.hasCode) {
      components.push({
        type: "CodePlayground",
        priority: 1,
        features: ["syntax_highlighting", "copy", "execution"],
        interactive: true,
      });
    }

    if (analysis.hasData) {
      components.push({
        type: "InteractiveDataTable",
        priority: 2,
        features: ["sorting", "filtering", "export"],
        interactive: true,
      });
    }

    if (analysis.hasMath) {
      components.push({
        type: "MathRenderer",
        priority: 1,
        features: ["latex", "interactive_graphs"],
        interactive: true,
      });
    }

    if (analysis.hasProcess) {
      components.push({
        type: "Timeline",
        priority: 2,
        features: ["interactive_steps", "progress_tracking"],
        interactive: true,
      });
    }

    if (analysis.complexity === "complex" || analysis.wordCount > 500) {
      components.push({
        type: "ProgressiveDisclosure",
        priority: 3,
        features: ["expandable_sections", "structured_navigation"],
        interactive: true,
      });
    }
  }

  return components.sort((a, b) => (a.priority || 1) - (b.priority || 1));
};

// Main AI response processing function
export const processAIResponse = (
  rawResponse: string,
  metadata?: Record<string, unknown>
): EnhancedAIResponse => {
  const analysis = analyzeResponseContent(rawResponse);
  const components = selectOptimalComponents(analysis);

  // Calculate quality score based on component utilization and content structure
  const qualityScore = calculateQualityScore(analysis, components);

  return {
    content: rawResponse,
    components,
    metadata: {
      ...metadata,
      analysis,
      componentCount: components.length,
      interactiveElements: components.filter((c) => c.interactive).length,
    },
    qualityScore,
  };
};

// Quality scoring algorithm
const calculateQualityScore = (
  analysis: ResponseAnalysis,
  components: ComponentDirective[]
): number => {
  let score = 0;

  // Base score for content quality
  if (analysis.wordCount > 50) score += 20;
  if (analysis.complexity === "moderate") score += 10;
  if (analysis.complexity === "complex") score += 20;

  // Component utilization scoring
  const componentTypes = new Set(components.map((c) => c.type));
  score += componentTypes.size * 15; // 15 points per unique component type

  // Interactive elements bonus
  const interactiveCount = components.filter((c) => c.interactive).length;
  score += interactiveCount * 10;

  // Structured data bonus
  if (analysis.hasStructuredData) score += 15;

  // Accessibility and usability considerations
  if (components.some((c) => c.features?.includes("keyboard_navigation")))
    score += 5;
  if (components.some((c) => c.features?.includes("screen_reader"))) score += 5;

  return Math.min(100, score); // Cap at 100
};

// Component registry - using existing components that likely exist
export const COMPONENT_REGISTRY = {
  MultiTurnSummary: () => import("@/components/chat/MultiTurnSummary"),
  // Note: Other components would be implemented as needed
} as const;

export type ComponentType = keyof typeof COMPONENT_REGISTRY;

// Load component dynamically
export const loadComponent = async (type: ComponentType) => {
  const componentLoader = COMPONENT_REGISTRY[type];
  if (!componentLoader) {
    console.warn(`Component type "${type}" not found in registry`);
    return null;
  }

  try {
    const componentModule = await componentLoader();
    return componentModule.default;
  } catch (error) {
    console.error(`Failed to load component "${type}":`, error);
    return null;
  }
};

// AI response enhancement patterns for prompt templates
export const AI_COMPONENT_PATTERNS = {
  // Code detection and enhancement
  CODE_PATTERNS: {
    triggers: [
      "```",
      "function",
      "class",
      "import",
      "def",
      "const",
      "let",
      "var",
    ],
    instructions: `
When your response contains code:
1. Wrap code in \`\`\`language blocks
2. Add <!-- COMPONENT: CodePlayground --> after code blocks
3. Include <!-- FEATURES: syntax_highlighting,copy,execution --> for interactive features
4. For executable code, add <!-- INTERACTIVE: true -->

Example:
\`\`\`python
def hello_world():
    print("Hello, World!")
\`\`\`
<!-- COMPONENT: CodePlayground -->
<!-- LANGUAGE: python -->
<!-- FEATURES: syntax_highlighting,copy,execution -->
<!-- INTERACTIVE: true -->
    `,
  },

  // Data visualization patterns
  DATA_PATTERNS: {
    triggers: ["table", "chart", "data", "metrics", "statistics", "analysis"],
    instructions: `
When your response contains tabular data or metrics:
1. Format data as markdown tables
2. Add <!-- COMPONENT: InteractiveDataTable --> after tables
3. Include <!-- FEATURES: sorting,filtering,export --> for interactivity
4. For metrics dashboards, use MetricsDashboard component

Example:
| Metric | Value | Change |
|--------|-------|--------|
| Speed  | 100ms | +20%   |
| Memory | 256MB | -15%   |

<!-- COMPONENT: InteractiveDataTable -->
<!-- FEATURES: sorting,filtering,export,charts -->
<!-- INTERACTIVE: true -->
    `,
  },

  // Process and workflow patterns
  PROCESS_PATTERNS: {
    triggers: ["steps", "process", "workflow", "timeline", "sequence"],
    instructions: `
When your response describes processes or workflows:
1. Structure as numbered or bulleted lists
2. Add <!-- COMPONENT: Timeline --> for sequential processes
3. Include <!-- FEATURES: interactive_steps,progress_tracking --> for interactivity

Example:
## Deployment Process

1. **Build** (5 min) - Compile and package application
2. **Test** (10 min) - Run automated tests
3. **Deploy** (15 min) - Deploy to production

<!-- COMPONENT: Timeline -->
<!-- TYPE: process -->
<!-- FEATURES: interactive_steps,progress_tracking -->
<!-- INTERACTIVE: true -->
    `,
  },

  // Summary and analysis patterns
  SUMMARY_PATTERNS: {
    triggers: ["summary", "analysis", "overview", "conclusions", "key points"],
    instructions: `
When your response is a summary or analysis:
1. Provide structured content with clear sections
2. Add <!-- COMPONENT: ProgressiveDisclosure --> for long content
3. Use <!-- COMPONENT: MultiTurnSummary --> for conversation summaries

Example:
## Analysis Summary

**Key Findings**: 3 major improvements identified
**Impact**: 40% performance increase expected

### Detailed Analysis
[Expandable content here]

<!-- COMPONENT: ProgressiveDisclosure -->
<!-- SECTIONS: summary,detailed_analysis,recommendations -->
<!-- INTERACTIVE: true -->
    `,
  },

  // Mathematical content patterns
  MATH_PATTERNS: {
    triggers: ["formula", "equation", "$$", "\\(", "theorem", "proof"],
    instructions: `
When your response contains mathematical content:
1. Use $$ for block math, $ for inline math
2. Add <!-- COMPONENT: MathRenderer --> after math blocks
3. Include <!-- FEATURES: latex,interactive_graphs --> for enhanced features

Example:
The quadratic formula:
$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

<!-- COMPONENT: MathRenderer -->
<!-- FEATURES: latex,interactive_graphs,step_by_step -->
<!-- INTERACTIVE: true -->
    `,
  },
};

// Generate AI instructions for component usage
export const generateAIInstructions = (): string => {
  return `
# AI Component Usage Instructions

When generating responses, analyze the content and automatically include component directives to enhance the user experience:

## Component Selection Rules

${Object.entries(AI_COMPONENT_PATTERNS)
  .map(
    ([key, pattern]) => `### ${key.replace("_", " ")}\n${pattern.instructions}`
  )
  .join("\n\n")}

## Quality Guidelines

1. **Always include component directives** for enhanced content
2. **Use appropriate features** based on content type
3. **Enable interactivity** when beneficial for user engagement
4. **Structure content clearly** with proper headings and sections
5. **Provide fallbacks** for users with accessibility needs

## Component Priority Order

1. **CodePlayground** - For any code content
2. **MathRenderer** - For mathematical formulas
3. **InteractiveDataTable** - For tabular data
4. **Timeline** - For processes and workflows
5. **ProgressiveDisclosure** - For long-form content
6. **MultiTurnSummary** - For conversation analysis

Remember: The goal is to make content more interactive, accessible, and engaging through intelligent component selection.
  `;
};

// Export instructions for AI prompt integration
export const AI_INSTRUCTIONS = generateAIInstructions();
