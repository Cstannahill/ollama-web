"use client";

import { useState } from "react";
import { useSettingsStore } from "@/stores/settings-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Icons
const SaveIcon = ({ className }: { className?: string }) => (
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
      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
    />
  </svg>
);

export const PresetManager = () => {
  const {
    agenticPresets,
    agenticConfig,
    savePreset,
    loadPreset,
    deletePreset,
    exportPresets,
    importPresets,
  } = useSettingsStore();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [importData, setImportData] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );

  const handleSavePreset = () => {
    if (presetName.trim()) {
      savePreset(presetName.trim(), presetDescription.trim());
      setPresetName("");
      setPresetDescription("");
      setShowSaveDialog(false);
    }
  };

  const handleLoadPreset = (presetId: string) => {
    loadPreset(presetId);
    setSelectedPreset(presetId);
  };

  const handleExport = () => {
    const data = exportPresets();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agentic-presets.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importPresets(importData)) {
      setImportData("");
      setShowImportDialog(false);
    }
  };

  const defaultPresetIds = ["balanced", "fast", "quality"];
  const customPresets = agenticPresets.filter(
    (p) => !defaultPresetIds.includes(p.id)
  );
  const defaultPresets = agenticPresets.filter((p) =>
    defaultPresetIds.includes(p.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Configuration Presets
        </h3>
        <div className="flex gap-2">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <SaveIcon className="w-4 h-4 mr-1" />
                Save Current
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Configuration Preset</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preset-name">Preset Name</Label>
                  <Input
                    id="preset-name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="My Custom Preset"
                  />
                </div>
                <div>
                  <Label htmlFor="preset-description">
                    Description (Optional)
                  </Label>
                  <Textarea
                    id="preset-description"
                    value={presetDescription}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setPresetDescription(e.target.value)
                    }
                    placeholder="Describe when to use this preset..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                  >
                    Save Preset
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" size="sm" onClick={handleExport}>
            Export
          </Button>

          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Presets</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-data">Preset JSON Data</Label>
                  <Textarea
                    id="import-data"
                    value={importData}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setImportData(e.target.value)
                    }
                    placeholder="Paste exported preset JSON here..."
                    rows={6}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowImportDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleImport} disabled={!importData.trim()}>
                    Import
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Preset Selection */}
      <div className="space-y-3">
        <Label>Load Preset</Label>
        <Select value={selectedPreset} onValueChange={handleLoadPreset}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a preset to load..." />
          </SelectTrigger>
          <SelectContent>
            {defaultPresets.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Default Presets
                </div>
                {defaultPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {preset.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </>
            )}

            {customPresets.length > 0 && (
              <>
                {defaultPresets.length > 0 && <div className="border-t my-1" />}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Custom Presets
                </div>
                {customPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {preset.description || "Custom configuration"}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Custom Preset Management */}
      {customPresets.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs">Custom Presets</Label>
          <div className="space-y-2">
            {customPresets.map((preset) => (
              <div
                key={preset.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{preset.name}</div>
                  {preset.description && (
                    <div className="text-xs text-muted-foreground">
                      {preset.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(preset.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLoadPreset(preset.id)}
                    className="h-7 px-2"
                  >
                    Load
                  </Button>
                  {deleteConfirmation === preset.id ? (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirmation(null)}
                        className="h-7 px-2"
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          deletePreset(preset.id);
                          setDeleteConfirmation(null);
                        }}
                        className="h-7 px-2"
                      >
                        Delete
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteConfirmation(preset.id)}
                      className="h-7 px-2 text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Config Summary */}
      <div className="space-y-2">
        <Label className="text-xs">Current Configuration</Label>
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className="text-xs">
            Docs: {agenticConfig.maxRetrievalDocs}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Summary: {agenticConfig.contextSummaryLength}
          </Badge>
          <Badge variant="outline" className="text-xs">
            History: {agenticConfig.historyLimit}
          </Badge>
          {agenticConfig.enableQueryRewriting && (
            <Badge variant="secondary" className="text-xs">
              Query Rewrite
            </Badge>
          )}
          {agenticConfig.enableResponseSummarization && (
            <Badge variant="secondary" className="text-xs">
              Response Summary
            </Badge>
          )}
          {agenticConfig.cachingEnabled && (
            <Badge variant="secondary" className="text-xs">
              Caching
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
