// Interactive Components - Advanced UI components for enhanced AI responses
export { CodePlayground } from "./CodePlayground";
export { InteractiveDataTable } from "./InteractiveDataTable";
export { Timeline } from "./Timeline";
export { ProgressiveDisclosure } from "./ProgressiveDisclosure";
export { MetricsDashboard } from "./MetricsDashboard";
export { MathRenderer } from "./MathRenderer";

// Re-export types for convenience
export type { default as CodePlaygroundProps } from "./CodePlayground";
export type { default as InteractiveDataTableProps } from "./InteractiveDataTable";
export type { default as TimelineProps } from "./Timeline";
export type { default as ProgressiveDisclosureProps } from "./ProgressiveDisclosure";
export type { default as MetricsDashboardProps } from "./MetricsDashboard";
export type { default as MathRendererProps } from "./MathRenderer";

// Component registry for dynamic component selection
export const INTERACTIVE_COMPONENTS = {
  CodePlayground: "CodePlayground",
  InteractiveDataTable: "InteractiveDataTable",
  Timeline: "Timeline",
  ProgressiveDisclosure: "ProgressiveDisclosure",
  MetricsDashboard: "MetricsDashboard",
  MathRenderer: "MathRenderer",
} as const;

export type InteractiveComponentType = keyof typeof INTERACTIVE_COMPONENTS;
