import { AI_COMPONENT_SYSTEM_PROMPT } from "./ai-component-prompts";

export const MARKDOWN_INSTRUCTIONS = [
  "Use the blockquote syntax (>) with TIP, INFO, WARNING or NOTE for callout boxes.",
  "For multi-file examples, separate files with a line containing three dashes (---) and begin each file with a fenced code block specifying the language and filename.",
  "Create diagrams with mermaid fenced blocks.",
  "Wrap optional sections in <details> with a <summary> title for collapsible content.",
  "Reference sources using GitHub footnote syntax.",
  "Highlight key lines in code blocks with {highlight: [n]} metadata.",
];

// Enhanced instructions that include AI component integration
export const ENHANCED_MARKDOWN_INSTRUCTIONS = [
  ...MARKDOWN_INSTRUCTIONS,
  "Use <!-- COMPONENT: ComponentName --> directives after code blocks to enable interactive features.",
  "Add <!-- FEATURES: feature1,feature2 --> to specify component capabilities.",
  "Structure responses with clear headings for automatic component detection.",
  "Use markdown tables for data that benefits from sorting and filtering.",
  "Number process steps for automatic timeline component enhancement.",
  "Use LaTeX math notation ($$) for formulas that benefit from interactive rendering.",
];

// Complete AI component integration instructions as an array
export const AI_COMPONENT_INSTRUCTIONS_ARRAY = [
  ...ENHANCED_MARKDOWN_INSTRUCTIONS,
  "COMPONENT INTEGRATION: Use <!-- COMPONENT: ComponentName --> directives for enhanced interactivity",
  "CODE ENHANCEMENT: Add <!-- COMPONENT: CodePlayground --> after code blocks for interactive features",
  "DATA ENHANCEMENT: Add <!-- COMPONENT: InteractiveDataTable --> after markdown tables",
  "PROCESS ENHANCEMENT: Add <!-- COMPONENT: Timeline --> for step-by-step processes",
  "MATH ENHANCEMENT: Add <!-- COMPONENT: MathRenderer --> after LaTeX formulas",
  "DISCLOSURE: Use <!-- COMPONENT: ProgressiveDisclosure --> for long content sections",
  "FEATURES: Specify <!-- FEATURES: feature1,feature2 --> to enable specific capabilities",
  "INTERACTIVITY: Set <!-- INTERACTIVE: true --> for user interaction features",
];

export default MARKDOWN_INSTRUCTIONS;
