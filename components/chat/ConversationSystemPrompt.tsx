"use client";

import { useState } from "react";
import { useConversationStore } from "@/stores/conversation-store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PromptTemplateManager } from "./PromptTemplateManager";
import { TemplateInstance } from "../../services/prompt-templates";

const SYSTEM_PROMPT_TEMPLATES = [
  {
    name: "Professional Assistant",
    description: "Formal, professional tone",
    prompt:
      "You are a professional assistant. Provide clear, concise, and helpful responses in a formal tone. Focus on accuracy and professionalism in all interactions.",
  },
  {
    name: "Creative Writer",
    description: "Creative and expressive writing",
    prompt:
      "You are a creative writing assistant. Help with storytelling, character development, and creative expression. Be imaginative and inspiring while maintaining literary quality.",
  },
  {
    name: "Technical Expert",
    description: "Technical and detailed explanations",
    prompt:
      "You are a technical expert. Provide detailed, accurate technical information with examples and code when relevant. Focus on precision and thorough explanations.",
  },
  {
    name: "Conversational Friend",
    description: "Casual and friendly tone",
    prompt:
      "You are a friendly conversational partner. Be casual, supportive, and engaging. Use a warm tone and feel free to ask follow-up questions to better understand the user's needs.",
  },
  {
    name: "Research Assistant",
    description: "Focused on research and analysis",
    prompt:
      "You are a research assistant. Help analyze information, synthesize data, and provide well-researched answers with citations when appropriate. Be thorough and methodical.",
  },
];

export function ConversationSystemPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const { getActiveConversation, updateSystemPrompt } = useConversationStore();

  const activeConversation = getActiveConversation();
  const currentSystemPrompt = activeConversation?.systemPrompt || "";

  const handleApplyTemplate = (
    template: (typeof SYSTEM_PROMPT_TEMPLATES)[0]
  ) => {
    if (activeConversation) {
      updateSystemPrompt(activeConversation.id, template.prompt);
      setCustomPrompt(template.prompt);
    }
  };

  const handleSelectTemplate = (instance: TemplateInstance) => {
    if (activeConversation) {
      updateSystemPrompt(activeConversation.id, instance.resolvedPrompt);
      setCustomPrompt(instance.resolvedPrompt);
      setIsTemplateManagerOpen(false);
    }
  };

  const handleSaveCustom = () => {
    if (activeConversation && customPrompt.trim()) {
      updateSystemPrompt(activeConversation.id, customPrompt.trim());
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    if (activeConversation) {
      updateSystemPrompt(activeConversation.id, "");
      setCustomPrompt("");
    }
  };

  // Initialize custom prompt with current value when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setCustomPrompt(currentSystemPrompt);
    }
    setIsOpen(open);
  };

  if (!activeConversation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs h-8">
          🎭 System Prompt
          {currentSystemPrompt && (
            <Badge variant="secondary" className="ml-2 h-4 px-1 text-xs">
              Active
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conversation System Prompt</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Set a system prompt that will influence how the AI responds in this
            conversation. This overrides the global system prompt for this
            specific chat.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Status:</span>
              {currentSystemPrompt ? (
                <Badge variant="outline" className="text-green-600">
                  System prompt active
                </Badge>
              ) : (
                <Badge variant="outline" className="text-gray-600">
                  Using global settings
                </Badge>
              )}
            </div>
            {currentSystemPrompt && (
              <p className="text-xs text-muted-foreground bg-background p-2 rounded border">
                {currentSystemPrompt.length > 150
                  ? `${currentSystemPrompt.substring(0, 150)}...`
                  : currentSystemPrompt}
              </p>
            )}
          </div>

          {/* Quick Templates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-sm font-medium">Quick Templates</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTemplateManagerOpen(true)}
                className="text-xs h-7"
              >
                📝 Advanced Templates
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SYSTEM_PROMPT_TEMPLATES.map((template) => (
                <div
                  key={template.name}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleApplyTemplate(template)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{template.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomPrompt(template.prompt);
                      }}
                    >
                      Preview
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {template.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Prompt Editor */}
          <div>
            <Label
              htmlFor="custom-prompt"
              className="text-sm font-medium mb-3 block"
            >
              Custom System Prompt
            </Label>
            <Textarea
              id="custom-prompt"
              placeholder="Enter your custom system prompt here..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[120px] text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Character count: {customPrompt.length}
              {customPrompt.length > 500 && (
                <span className="text-yellow-600 ml-2">
                  ⚠️ Long prompts may affect performance
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!currentSystemPrompt}
            >
              Clear Prompt
            </Button>

            <div className="space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveCustom}
                disabled={!customPrompt.trim()}
              >
                Apply Custom Prompt
              </Button>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              💡 Tips for Effective System Prompts
            </h4>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Be specific about the desired tone and style</li>
              <li>• Include relevant context about the conversation topic</li>
              <li>• Keep prompts concise but comprehensive</li>
              <li>• Test different prompts to find what works best</li>
              <li>• System prompts apply to new messages, not existing ones</li>
            </ul>
          </div>
        </div>

        {/* Template Manager Modal */}
        <PromptTemplateManager
          isOpen={isTemplateManagerOpen}
          onClose={() => setIsTemplateManagerOpen(false)}
          onSelectTemplate={handleSelectTemplate}
        />
      </DialogContent>
    </Dialog>
  );
}
