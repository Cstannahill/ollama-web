"use client";
import { Download, Info, Play, Clock, Cpu } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Model } from "@/types";
import { useModelStore } from "@/stores/model-store";

interface ModelCardProps {
  model: Model;
  onSelect: (model: Model) => void;
  isDownloaded?: boolean;
}

export const ModelCard = ({ model, onSelect, isDownloaded }: ModelCardProps) => {
  const { downloadModel, downloadProgress } = useModelStore();
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
          <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-blue-600" />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-2 right-2 flex gap-1">
            {model.capabilities?.map((cap) => (
              <Badge key={cap} variant="secondary" className="text-xs">
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
              <Button className="flex-1" onClick={() => onSelect(model)}>
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
            <Button variant="outline" size="icon" aria-label="Model info">
              <Info className="w-4 h-4" aria-hidden />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
