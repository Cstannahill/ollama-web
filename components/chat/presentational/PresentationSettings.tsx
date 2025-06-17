import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Palette,
  Eye,
  Zap,
  Settings,
  RotateCcw,
  Monitor,
  Smartphone,
  Maximize,
} from "lucide-react";
import type { PresentationConfig } from "@/types/langchain/PipelineOutput";

interface PresentationSettingsProps {
  config: PresentationConfig;
  onChange: (config: PresentationConfig) => void;
}

export const PresentationSettings = ({
  config,
  onChange,
}: PresentationSettingsProps) => {
  const presets = {
    research: {
      prefer: "detailed" as const,
      theme: "default" as const,
      showMetrics: true,
      showSources: true,
      animationLevel: "subtle" as const,
    },
    quick: {
      prefer: "compact" as const,
      theme: "minimal" as const,
      showMetrics: false,
      showSources: false,
      animationLevel: "none" as const,
    },
    visual: {
      prefer: "detailed" as const,
      theme: "rich" as const,
      showMetrics: true,
      showSources: true,
      animationLevel: "full" as const,
    },
    coding: {
      prefer: "compact" as const,
      theme: "minimal" as const,
      showMetrics: false,
      showSources: false,
      animationLevel: "none" as const,
    },
  };

  const updateConfig = (updates: Partial<PresentationConfig>) => {
    onChange({ ...config, ...updates });
  };

  const applyPreset = (presetName: keyof typeof presets) => {
    onChange(presets[presetName]);
  };

  const resetToDefaults = () => {
    onChange({
      prefer: "detailed",
      theme: "default",
      showMetrics: true,
      showSources: true,
      animationLevel: "subtle",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Presentation Settings
          <Badge variant="outline" className="ml-auto">
            Enhanced UI
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Presets */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("research")}
              className="flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Research
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("quick")}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Quick
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("visual")}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Visual
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyPreset("coding")}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Coding
            </Button>
          </div>
        </div>

        <Separator />

        {/* Layout Preference */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Layout Style</Label>
          <Select
            value={config.prefer || "detailed"}
            onValueChange={(value: "compact" | "detailed" | "visual") =>
              updateConfig({ prefer: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <div>
                    <div>Compact</div>
                    <div className="text-xs text-muted-foreground">
                      Minimal space, essential info only
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="detailed">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4" />
                  <div>
                    <div>Detailed</div>
                    <div className="text-xs text-muted-foreground">
                      Full information with context
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="visual">
                <div className="flex items-center gap-2">
                  <Maximize className="w-4 h-4" />
                  <div>
                    <div>Visual</div>
                    <div className="text-xs text-muted-foreground">
                      Rich graphics and animations
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Theme Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Visual Theme</Label>
          <Select
            value={config.theme || "default"}
            onValueChange={(value: "default" | "minimal" | "rich") =>
              updateConfig({ theme: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
              <SelectItem value="rich">Rich</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Animation Level */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Animation Level</Label>
          <Select
            value={config.animationLevel || "subtle"}
            onValueChange={(value: "none" | "subtle" | "full") =>
              updateConfig({ animationLevel: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Best Performance)</SelectItem>
              <SelectItem value="subtle">Subtle</SelectItem>
              <SelectItem value="full">Full (Rich Experience)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Content Toggles */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Content Display</Label>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Show Performance Metrics</Label>
              <p className="text-xs text-muted-foreground">
                Display processing times and efficiency stats
              </p>
            </div>
            <Switch
              checked={config.showMetrics ?? true}
              onCheckedChange={(checked) =>
                updateConfig({ showMetrics: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm">Show Document Sources</Label>
              <p className="text-xs text-muted-foreground">
                Display source documents and references
              </p>
            </div>
            <Switch
              checked={config.showSources ?? true}
              onCheckedChange={(checked) =>
                updateConfig({ showSources: checked })
              }
            />
          </div>
        </div>

        <Separator />

        {/* Reset Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefaults}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </Button>
        </div>

        {/* Current Configuration Preview */}
        <div className="bg-muted/50 rounded-lg p-3 text-xs">
          <div className="font-medium mb-2">Current Configuration:</div>
          <div className="space-y-1 text-muted-foreground">
            <div>Layout: {config.prefer || "detailed"}</div>
            <div>Theme: {config.theme || "default"}</div>
            <div>Animation: {config.animationLevel || "subtle"}</div>
            <div>Metrics: {config.showMetrics ? "shown" : "hidden"}</div>
            <div>Sources: {config.showSources ? "shown" : "hidden"}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
