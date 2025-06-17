// AI-Enhanced Chat Message Component
// This component automatically detects and renders advanced components based on AI response content

import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, BarChart3, Clock, Brain, Zap } from "lucide-react";
import {
  processAIResponse,
  ComponentDirective,
  EnhancedAIResponse,
  AI_INSTRUCTIONS,
} from "@/services/ai-component-selection";
import { ChatMarkdownViewer } from "@/components/markdown/ChatMarkdownViewer";
import {
  CodePlayground,
  InteractiveDataTable,
  Timeline,
  ProgressiveDisclosure,
  MetricsDashboard,
  MathRenderer,
} from "@/components/interactive";

interface AIEnhancedMessageProps {
  content: string;
  metadata?: Record<string, unknown>;
  className?: string;
  showAnalytics?: boolean;
}

// Component Data Interfaces
interface CodePlaygroundData {
  code: string;
  language: string;
  title: string;
}

interface InteractiveDataTableData {
  data: Record<string, string | number>[];
  columns: Array<{
    key: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
  }>;
  title: string;
}

interface TimelineData {
  steps: Array<{
    id: string;
    title: string;
    status: "completed" | "current" | "pending";
    timestamp: string;
  }>;
  title: string;
}

interface MetricsDashboardData {
  metrics: Array<{
    id: string;
    label: string;
    value: number;
    format: "percentage" | "currency" | "number";
    color: "success" | "info" | "warning" | "error";
  }>;
  title: string;
}

interface MathRendererData {
  expression: string;
  title: string;
}

interface ProgressiveDisclosureData {
  sections: Array<{
    id: string;
    title: string;
    content: string;
    level: number;
    defaultExpanded: boolean;
  }>;
  title: string;
}

type ComponentData =
  | CodePlaygroundData
  | InteractiveDataTableData
  | TimelineData
  | MetricsDashboardData
  | MathRendererData
  | ProgressiveDisclosureData
  | null;

export const AIEnhancedMessage = ({
  content,
  metadata,
  className,
  showAnalytics = false,
}: AIEnhancedMessageProps) => {
  // Process the AI response to detect components and enhancements
  const enhancedResponse = useMemo(() => {
    return processAIResponse(content, metadata);
  }, [content, metadata]);

  // Component icon mapping
  const getComponentIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      CodePlayground: Code,
      InteractiveDataTable: BarChart3,
      MetricsDashboard: BarChart3,
      Timeline: Clock,
      MultiTurnSummary: Brain,
      ProgressiveDisclosure: Zap,
    };
    return icons[type] || Brain;
  };

  // Component color mapping
  const getComponentColor = (type: string) => {
    const colors: Record<string, string> = {
      CodePlayground: "text-blue-500 bg-blue-50 border-blue-200",
      InteractiveDataTable: "text-green-500 bg-green-50 border-green-200",
      MetricsDashboard: "text-purple-500 bg-purple-50 border-purple-200",
      Timeline: "text-orange-500 bg-orange-50 border-orange-200",
      MultiTurnSummary: "text-indigo-500 bg-indigo-50 border-indigo-200",
      ProgressiveDisclosure: "text-pink-500 bg-pink-50 border-pink-200",
    };
    return colors[type] || "text-gray-500 bg-gray-50 border-gray-200";
  };

  return (
    <div className={`ai-enhanced-message space-y-4 ${className || ""}`}>
      {/* Enhanced Content Rendering */}
      <div className="enhanced-content">
        <ChatMarkdownViewer
          content={enhancedResponse.content}
          className="bg-transparent"
        />
      </div>

      {/* Component Enhancements */}
      {enhancedResponse.components.length > 0 && (
        <div className="component-enhancements space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span>
              Enhanced with {enhancedResponse.components.length} interactive
              component{enhancedResponse.components.length > 1 ? "s" : ""}
            </span>
          </div>

          <AnimatePresence>
            {enhancedResponse.components.map((component, index) => (
              <ComponentEnhancementCard
                key={`${component.type}-${index}`}
                directive={component}
                icon={getComponentIcon(component.type)}
                colorClass={getComponentColor(component.type)}
                originalContent={content}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Analytics Panel (Development/Debug) */}
      {showAnalytics && (
        <ResponseAnalyticsPanel enhancedResponse={enhancedResponse} />
      )}
    </div>
  );
};

// Component Enhancement Card
interface ComponentEnhancementCardProps {
  directive: ComponentDirective;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  originalContent: string;
}

const ComponentEnhancementCard = ({
  directive,
  icon: Icon,
  colorClass,
  originalContent,
}: ComponentEnhancementCardProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Extract component data from content based on type
  const extractComponentData = (
    type: string,
    content: string
  ): ComponentData => {
    switch (type) {
      case "CodePlayground": {
        const codeMatch = content.match(/```(\w+)?\n([\s\S]*?)```/);
        if (codeMatch) {
          return {
            code: codeMatch[2].trim(),
            language: codeMatch[1] || "javascript",
            title: "Code Example",
          } as CodePlaygroundData;
        }
        return {
          code: "// No code block found in content",
          language: "javascript",
          title: "Code Example",
        } as CodePlaygroundData;
      }

      case "InteractiveDataTable": {
        // Try to extract markdown table
        const tableMatch = content.match(/\|.*\|[\s\S]*?\n\s*$/m);
        if (tableMatch) {
          const lines = tableMatch[0].split("\n").filter((line) => line.trim());
          const headers = lines[0]
            .split("|")
            .map((h) => h.trim())
            .filter((h) => h);
          const data = lines.slice(2).map((line) => {
            const cells = line
              .split("|")
              .map((c) => c.trim())
              .filter((c) => c);
            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
              row[header] = cells[index] || "";
            });
            return row;
          });

          return {
            data: data.slice(0, 10), // Limit to 10 rows for display
            columns: headers.map((header) => ({
              key: header,
              header: header,
              sortable: true,
              filterable: true,
            })),
            title: "Data Table",
          } as InteractiveDataTableData;
        }
        // Fallback example data
        return {
          data: [
            { name: "Item 1", value: "100", status: "Active" },
            { name: "Item 2", value: "200", status: "Inactive" },
            { name: "Item 3", value: "150", status: "Active" },
          ],
          columns: [
            { key: "name", header: "Name", sortable: true },
            { key: "value", header: "Value", sortable: true },
            { key: "status", header: "Status", filterable: true },
          ],
          title: "Example Data",
        } as InteractiveDataTableData;
      }

      case "Timeline": {
        // Extract numbered steps or process items
        const stepPattern = /\d+\.\s+(.+?)(?=\n\d+\.|\n\n|$)/g;
        const steps = [];
        let stepMatch;
        let stepIndex = 1;

        while ((stepMatch = stepPattern.exec(content)) !== null) {
          steps.push({
            id: `step-${stepIndex}`,
            title: stepMatch[1].trim(),
            status:
              stepIndex === 1
                ? ("completed" as const)
                : stepIndex === 2
                  ? ("current" as const)
                  : ("pending" as const),
            timestamp: `Step ${stepIndex}`,
          });
          stepIndex++;
        }

        if (steps.length === 0) {
          // Fallback example
          steps.push(
            {
              id: "1",
              title: "Initial Setup",
              status: "completed" as const,
              timestamp: "Step 1",
            },
            {
              id: "2",
              title: "Configuration",
              status: "current" as const,
              timestamp: "Step 2",
            },
            {
              id: "3",
              title: "Deployment",
              status: "pending" as const,
              timestamp: "Step 3",
            }
          );
        }

        return { steps, title: "Process Timeline" } as TimelineData;
      }

      case "MetricsDashboard": {
        // Extract numbers and create metrics
        const numberPattern = /(\d+(?:\.\d+)?)\s*([%$]?)/g;
        const metrics = [];
        let metricMatch;
        let metricIndex = 1;

        while (
          (metricMatch = numberPattern.exec(content)) !== null &&
          metrics.length < 6
        ) {
          metrics.push({
            id: `metric-${metricIndex}`,
            label: `Metric ${metricIndex}`,
            value: parseFloat(metricMatch[1]),
            format:
              metricMatch[2] === "%"
                ? ("percentage" as const)
                : metricMatch[2] === "$"
                  ? ("currency" as const)
                  : ("number" as const),
            color:
              metricIndex % 2 === 0 ? ("success" as const) : ("info" as const),
          });
          metricIndex++;
        }

        if (metrics.length === 0) {
          // Fallback example
          metrics.push(
            {
              id: "1",
              label: "Performance",
              value: 95,
              format: "percentage" as const,
              color: "success" as const,
            },
            {
              id: "2",
              label: "Users",
              value: 1234,
              format: "number" as const,
              color: "info" as const,
            },
            {
              id: "3",
              label: "Revenue",
              value: 5678,
              format: "currency" as const,
              color: "success" as const,
            }
          );
        }

        return { metrics, title: "Key Metrics" } as MetricsDashboardData;
      }

      case "MathRenderer": {
        const mathMatch = content.match(/\$\$([\s\S]*?)\$\$/);
        if (mathMatch) {
          return {
            expression: mathMatch[1].trim(),
            title: "Mathematical Expression",
          } as MathRendererData;
        }
        return {
          expression: "E = mc^2",
          title: "Example Formula",
        } as MathRendererData;
      }

      case "ProgressiveDisclosure": {
        // Extract sections from headers
        const headerPattern = /^#{1,3}\s+(.+?)$([\s\S]*?)(?=^#{1,3}\s+|$)/gm;
        const sections = [];
        let sectionMatch;
        let sectionIndex = 1;

        while ((sectionMatch = headerPattern.exec(content)) !== null) {
          sections.push({
            id: `section-${sectionIndex}`,
            title: sectionMatch[1].trim(),
            content: sectionMatch[2].trim(),
            level: (sectionMatch[0].match(/^#+/) || [""])[0].length - 1,
            defaultExpanded: sectionIndex === 1,
          });
          sectionIndex++;
        }

        if (sections.length === 0) {
          // Fallback example
          sections.push(
            {
              id: "1",
              title: "Introduction",
              content:
                "This is the introduction section with basic information.",
              level: 0,
              defaultExpanded: true,
            },
            {
              id: "2",
              title: "Details",
              content: "This section contains more detailed information.",
              level: 0,
              defaultExpanded: false,
            }
          );
        }

        return {
          sections,
          title: "Content Sections",
        } as ProgressiveDisclosureData;
      }

      default:
        return null;
    }
  };

  // Render the actual interactive component based on directive
  const renderComponent = () => {
    const { type } = directive;
    const componentData = extractComponentData(type, originalContent);

    if (!componentData) return null;

    switch (type) {
      case "CodePlayground": {
        const data = componentData as CodePlaygroundData;
        return (
          <CodePlayground
            code={data.code}
            language={data.language}
            title={data.title}
            editable={directive.features?.includes("editable")}
            runnable={directive.features?.includes("execution")}
          />
        );
      }

      case "InteractiveDataTable": {
        const data = componentData as InteractiveDataTableData;
        if (data.data && data.columns) {
          return (
            <InteractiveDataTable
              data={data.data}
              columns={data.columns}
              title={data.title}
              searchable={directive.features?.includes("filtering")}
              pagination={true}
            />
          );
        }
        return null;
      }

      case "Timeline": {
        const data = componentData as TimelineData;
        if (data.steps) {
          return (
            <Timeline
              steps={data.steps}
              title={data.title}
              orientation="vertical"
              interactive={directive.features?.includes("interactive_steps")}
            />
          );
        }
        return null;
      }

      case "ProgressiveDisclosure": {
        const data = componentData as ProgressiveDisclosureData;
        if (data.sections) {
          return (
            <ProgressiveDisclosure
              sections={data.sections}
              title={data.title}
              showProgress={directive.features?.includes("progress_tracking")}
            />
          );
        }
        return null;
      }

      case "MetricsDashboard": {
        const data = componentData as MetricsDashboardData;
        if (data.metrics) {
          return (
            <MetricsDashboard
              metrics={data.metrics}
              title={data.title}
              showTrends={false}
            />
          );
        }
        return null;
      }

      case "MathRenderer": {
        const data = componentData as MathRendererData;
        if (data.expression) {
          return (
            <MathRenderer
              expression={data.expression}
              title={data.title}
              editable={false}
            />
          );
        }
        return null;
      }

      default:
        return null;
    }
  };

  const renderedComponent = renderComponent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border ${colorClass}`}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {directive.type}
              {directive.interactive && (
                <Badge variant="secondary" className="text-xs">
                  Interactive
                </Badge>
              )}
            </div>
            {renderedComponent && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs px-2 py-1 bg-muted hover:bg-muted/80 rounded transition-colors"
              >
                {isExpanded ? "Hide" : "Show"}
              </button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {directive.features && directive.features.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {directive.features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature.replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            )}

            {!renderedComponent ? (
              <div className="text-xs text-muted-foreground">
                This content can be enhanced with {directive.type} for better
                interactivity.
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Interactive {directive.type} component available
              </div>
            )}

            {/* Render the actual component */}
            {isExpanded && renderedComponent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3"
              >
                {renderedComponent}
              </motion.div>
            )}

            {!renderedComponent && (
              <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                <code>Component: {directive.type}</code>
                {directive.data && <div>Data Source: {directive.data}</div>}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Response Analytics Panel (for development)
interface ResponseAnalyticsPanelProps {
  enhancedResponse: EnhancedAIResponse;
}

const ResponseAnalyticsPanel = ({
  enhancedResponse,
}: ResponseAnalyticsPanelProps) => {
  const analysis = enhancedResponse.metadata.analysis as {
    hasCode: boolean;
    hasData: boolean;
    hasMath: boolean;
    hasProcess: boolean;
    complexity: string;
    wordCount: number;
  };

  return (
    <Card className="border-dashed border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-yellow-700">
          <Brain className="w-4 h-4" />
          AI Response Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <div className="font-medium">Quality Score</div>
            <div className="text-yellow-600">
              {enhancedResponse.qualityScore}/100
            </div>
          </div>
          <div>
            <div className="font-medium">Complexity</div>
            <div className="text-yellow-600">{analysis.complexity}</div>
          </div>
          <div>
            <div className="font-medium">Word Count</div>
            <div className="text-yellow-600">{analysis.wordCount}</div>
          </div>
          <div>
            <div className="font-medium">Components</div>
            <div className="text-yellow-600">
              {enhancedResponse.components.length}
            </div>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <div className="text-xs font-medium text-yellow-700">
            Content Features:
          </div>
          <div className="flex flex-wrap gap-1">
            {analysis.hasCode && (
              <Badge variant="outline" className="text-xs">
                Code
              </Badge>
            )}
            {analysis.hasData && (
              <Badge variant="outline" className="text-xs">
                Data
              </Badge>
            )}
            {analysis.hasMath && (
              <Badge variant="outline" className="text-xs">
                Math
              </Badge>
            )}
            {analysis.hasProcess && (
              <Badge variant="outline" className="text-xs">
                Process
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Hook for using AI response enhancement in other components
export const useAIResponseEnhancement = (
  content: string,
  metadata?: Record<string, unknown>
) => {
  return useMemo(() => {
    if (!content) return null;
    return processAIResponse(content, metadata);
  }, [content, metadata]);
};

// AI Instructions Component for including in prompts
export const AIInstructionsProvider = () => {
  return (
    <div className="hidden" data-ai-instructions={AI_INSTRUCTIONS}>
      {/* This component provides AI instructions as data attributes for prompt engineering */}
    </div>
  );
};

export default AIEnhancedMessage;
