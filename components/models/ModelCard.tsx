"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModelInfoDialog } from "./ModelInfoDialog";
import type { Model } from "@/types";
import { useModelStore } from "@/stores/model-store";

// Custom icons to avoid lucide-react issues
const Download = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
    />
  </svg>
);

const Info = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Play = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15M9 10v4a1 1 0 01-1 1H6.5a1 1 0 01-1-1v-4a1 1 0 011-1H8a1 1 0 011 1zm3 0h2.5a1 1 0 011 1v4a1 1 0 01-1 1H12"
    />
  </svg>
);

const Clock = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const Cpu = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
    />
  </svg>
);

function getModelGradient(caps?: string[]) {
  if (!caps || caps.length === 0) return "from-green-600 to-blue-600";
  if (caps.includes("Vision")) return "from-pink-600 to-purple-600";
  if (caps.includes("Code")) return "from-yellow-500 to-orange-600";
  if (caps.includes("Chat")) return "from-green-600 to-blue-600";
  return "from-indigo-600 to-blue-600";
}

// Determine if a model is good for specific tasks
function getModelHints(modelName: string) {
  const name = modelName.toLowerCase();
  const hints = [];

  // Embedding models
  if (
    name.includes("embed") ||
    name.includes("nomic") ||
    name.includes("minilm") ||
    name.includes("sentence") ||
    name.includes("all-") ||
    name.includes("bge")
  ) {
    hints.push({
      type: "embedding",
      label: "🔍 Great for Embedding",
      description: "Excellent for document similarity and vector search",
    });
  }

  // Good reranking models (general chat models work well for reranking)
  if (
    name.includes("llama") ||
    name.includes("mistral") ||
    name.includes("qwen") ||
    name.includes("gemma") ||
    name.includes("phi")
  ) {
    hints.push({
      type: "reranking",
      label: "🎯 Good for Reranking",
      description: "Can effectively rank and refine search results",
    });
  }

  // Code models
  if (
    name.includes("code") ||
    name.includes("coder") ||
    name.includes("deepseek-coder")
  ) {
    hints.push({
      type: "code",
      label: "💻 Code Specialist",
      description: "Optimized for programming and code generation",
    });
  }

  // Vision models
  if (
    name.includes("vision") ||
    name.includes("visual") ||
    name.includes("llava")
  ) {
    hints.push({
      type: "vision",
      label: "👁️ Vision Capable",
      description: "Can process and understand images",
    });
  }

  return hints;
}

interface ModelCardProps {
  model: Model;
  onSelect: (model: Model) => void;
  isDownloaded?: boolean;
}

export const ModelCard = ({
  model,
  onSelect,
  isDownloaded,
}: ModelCardProps) => {
  const { downloadModel, downloadProgress, markUsed } = useModelStore();
  const modelHints = getModelHints(model.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="overflow-hidden glass-morphism border-white/10 hover:border-white/20 transition-all duration-300">
        <div className="h-32 relative overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getModelGradient(model.capabilities)}`}
          />
          <div className="absolute inset-0 bg-black/20" />{" "}
          <div className="absolute top-2 right-2 flex gap-1">
            {model.capabilities?.map((cap: string, index: number) => (
              <Badge
                key={`${cap}-${index}`}
                variant="secondary"
                className="text-xs"
              >
                {cap}
              </Badge>
            ))}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{model.name}</h3>
            {model.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {model.description}
              </p>
            )}
          </div>
          {/* Model hints for agentic use cases */}
          {modelHints.length > 0 && (
            <div className="space-y-1">
              {modelHints.slice(0, 2).map((hint) => (
                <div
                  key={hint.type}
                  className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800"
                  title={hint.description}
                >
                  {hint.label}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" aria-hidden />
              {model.size}
            </span>
            {model.performance && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden />
                {model.performance}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {isDownloaded ? (
              <Button
                className="flex-1"
                onClick={() => {
                  markUsed(model.id);
                  onSelect(model);
                }}
              >
                <Play className="w-4 h-4 mr-1" aria-hidden /> Launch
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => downloadModel(model.id)}
                disabled={downloadProgress[model.id] !== undefined}
              >
                {downloadProgress[model.id] ? (
                  <span>{Math.round(downloadProgress[model.id])}%</span>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-1" aria-hidden /> Download
                  </>
                )}
              </Button>
            )}
            <ModelInfoDialog
              model={model}
              trigger={
                <Button variant="outline" size="icon" aria-label="Model info">
                  <Info className="w-4 h-4" aria-hidden />
                </Button>
              }
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
