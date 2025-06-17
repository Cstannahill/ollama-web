import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit3,
  Trash2,
  Copy,
  Download,
  Upload,
  Search,
  Tag,
  Settings,
  Check,
  X,
  Eye,
} from "lucide-react";
import {
  PromptTemplate,
  PromptVariable,
  PromptCategory,
  TemplateInstance,
  PromptTemplateService,
} from "../../services/prompt-templates";

interface PromptTemplateManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (instance: TemplateInstance) => void;
  selectedTemplateId?: string;
}

const CATEGORY_COLORS: Record<PromptCategory, string> = {
  general: "bg-blue-100 text-blue-800",
  coding: "bg-green-100 text-green-800",
  analysis: "bg-purple-100 text-purple-800",
  creative: "bg-pink-100 text-pink-800",
  research: "bg-yellow-100 text-yellow-800",
  support: "bg-gray-100 text-gray-800",
  custom: "bg-indigo-100 text-indigo-800",
};

const CATEGORY_LABELS: Record<PromptCategory, string> = {
  general: "General",
  coding: "Coding",
  analysis: "Analysis",
  creative: "Creative",
  research: "Research",
  support: "Support",
  custom: "Custom",
};

export const PromptTemplateManager: React.FC<PromptTemplateManagerProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  selectedTemplateId,
}) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    PromptCategory | "all"
  >("all");
  const [viewMode, setViewMode] = useState<
    "list" | "edit" | "create" | "preview"
  >("list");
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);
  const [editedTemplate, setEditedTemplate] = useState<Partial<PromptTemplate>>(
    {}
  );
  const [templateVariables, setTemplateVariables] = useState<
    Record<string, string | number>
  >({});
  const [previewPrompt, setPreviewPrompt] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTemplate && templateVariables) {
      try {
        const resolved = PromptTemplateService.resolveTemplate(
          selectedTemplate.id,
          templateVariables
        );
        setPreviewPrompt(resolved);
      } catch (error) {
        setPreviewPrompt("Error resolving template variables");
      }
    }
  }, [selectedTemplate, templateVariables]);

  const loadTemplates = () => {
    const allTemplates = PromptTemplateService.getTemplates();
    setTemplates(allTemplates);
  };

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEditTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setEditedTemplate(template);

    // Initialize variables with default values
    const initialVariables: Record<string, string | number> = {};
    template.variables.forEach((variable) => {
      initialVariables[variable.name] = variable.defaultValue || "";
    });
    setTemplateVariables(initialVariables);

    setViewMode("edit");
  };

  const handleCreateTemplate = () => {
    const newTemplate: Partial<PromptTemplate> = {
      name: "",
      description: "",
      template: "",
      variables: [],
      category: "custom",
      isBuiltIn: false,
    };
    setEditedTemplate(newTemplate);
    setSelectedTemplate(null);
    setViewMode("create");
  };

  const handleSaveTemplate = () => {
    if (!editedTemplate.name || !editedTemplate.template) return;

    try {
      if (selectedTemplate && !selectedTemplate.isBuiltIn) {
        // Update existing custom template
        PromptTemplateService.updateTemplate(
          selectedTemplate.id,
          editedTemplate
        );
      } else {
        // Create new template
        PromptTemplateService.saveTemplate(
          editedTemplate as Omit<
            PromptTemplate,
            "id" | "createdAt" | "updatedAt"
          >
        );
      }

      loadTemplates();
      setViewMode("list");
      setSelectedTemplate(null);
      setEditedTemplate({});
    } catch (error) {
      console.error("Error saving template:", error);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      PromptTemplateService.deleteTemplate(templateId);
      loadTemplates();
    }
  };

  const handleSelectTemplate = (template: PromptTemplate) => {
    if (!onSelectTemplate) return;

    // Initialize variables with default values
    const initialVariables: Record<string, string | number> = {};
    template.variables.forEach((variable) => {
      initialVariables[variable.name] = variable.defaultValue || "";
    });

    try {
      const resolvedPrompt = PromptTemplateService.resolveTemplate(
        template.id,
        initialVariables
      );
      onSelectTemplate({
        templateId: template.id,
        variables: initialVariables,
        resolvedPrompt,
      });
    } catch (error) {
      console.error("Error resolving template:", error);
    }
  };

  const handlePreviewTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);

    // Initialize variables with default values
    const initialVariables: Record<string, string | number> = {};
    template.variables.forEach((variable) => {
      initialVariables[variable.name] = variable.defaultValue || "";
    });
    setTemplateVariables(initialVariables);

    setViewMode("preview");
  };

  const handleExportTemplates = () => {
    const exportData = PromptTemplateService.exportTemplates();
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-templates-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportTemplates = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const result = PromptTemplateService.importTemplates(content);

        if (result.success) {
          alert(`Successfully imported ${result.imported} templates`);
          loadTemplates();
        } else {
          alert(`Import failed: ${result.errors.join("\n")}`);
        }
      } catch (error) {
        alert("Error reading file");
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = "";
  };

  const addVariable = () => {
    const newVariable: PromptVariable = {
      name: "",
      description: "",
      type: "text",
      required: false,
    };

    setEditedTemplate((prev) => ({
      ...prev,
      variables: [...(prev.variables || []), newVariable],
    }));
  };

  const updateVariable = (index: number, updates: Partial<PromptVariable>) => {
    setEditedTemplate((prev) => ({
      ...prev,
      variables: prev.variables?.map((variable, i) =>
        i === index ? { ...variable, ...updates } : variable
      ),
    }));
  };

  const removeVariable = (index: number) => {
    setEditedTemplate((prev) => ({
      ...prev,
      variables: prev.variables?.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Prompt Templates</h2>
              <p className="text-blue-100 mt-1">
                Manage and customize system prompt templates
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-r overflow-y-auto">
            {viewMode === "list" && (
              <div className="p-4 space-y-4">
                {/* Search and filters */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) =>
                      setSelectedCategory(
                        e.target.value as PromptCategory | "all"
                      )
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateTemplate}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New
                  </button>

                  <button
                    onClick={handleExportTemplates}
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    title="Export templates"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <label
                    className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors cursor-pointer"
                    title="Import templates"
                  >
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportTemplates}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Template list */}
                <div className="space-y-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTemplateId === template.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {template.description}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${CATEGORY_COLORS[template.category]}`}
                            >
                              {CATEGORY_LABELS[template.category]}
                            </span>
                            {template.isBuiltIn && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                Built-in
                              </span>
                            )}
                            {template.variables.length > 0 && (
                              <span className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
                                {template.variables.length} vars
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-3">
                        <button
                          onClick={() => handlePreviewTemplate(template)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {onSelectTemplate && (
                          <button
                            onClick={() => handleSelectTemplate(template)}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Use template"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleEditTemplate(template)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {!template.isBuiltIn && (
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === "list" && (
              <div className="p-8 text-center">
                <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600">
                  Choose a template from the sidebar to preview, edit, or use it
                  in your conversation.
                </p>
              </div>
            )}

            {(viewMode === "edit" || viewMode === "create") && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">
                    {viewMode === "create"
                      ? "Create Template"
                      : "Edit Template"}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("list")}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      disabled={
                        !editedTemplate.name || !editedTemplate.template
                      }
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Template form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template Name *
                      </label>
                      <input
                        type="text"
                        value={editedTemplate.name || ""}
                        onChange={(e) =>
                          setEditedTemplate((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter template name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={editedTemplate.description || ""}
                        onChange={(e) =>
                          setEditedTemplate((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                        placeholder="Describe what this template is for"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={editedTemplate.category || "custom"}
                        onChange={(e) =>
                          setEditedTemplate((prev) => ({
                            ...prev,
                            category: e.target.value as PromptCategory,
                          }))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Content *
                    </label>
                    <textarea
                      value={editedTemplate.template || ""}
                      onChange={(e) =>
                        setEditedTemplate((prev) => ({
                          ...prev,
                          template: e.target.value,
                        }))
                      }
                      className="w-full h-48 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      placeholder="Enter your system prompt template. Use {{variable_name}} for variables."
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Use <code>{`{{variable_name}}`}</code> to insert variables
                      into your template.
                    </p>
                  </div>
                </div>

                {/* Variables section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">
                      Variables
                    </h4>
                    <button
                      onClick={addVariable}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Variable
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editedTemplate.variables?.map((variable, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Variable Name
                            </label>
                            <input
                              type="text"
                              value={variable.name}
                              onChange={(e) =>
                                updateVariable(index, { name: e.target.value })
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="variable_name"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Type
                            </label>
                            <select
                              value={variable.type}
                              onChange={(e) =>
                                updateVariable(index, {
                                  type: e.target
                                    .value as PromptVariable["type"],
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="text">Text</option>
                              <option value="textarea">Textarea</option>
                              <option value="number">Number</option>
                              <option value="select">Select</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Default Value
                            </label>
                            <input
                              type="text"
                              value={variable.defaultValue || ""}
                              onChange={(e) =>
                                updateVariable(index, {
                                  defaultValue: e.target.value,
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Default value"
                            />
                          </div>

                          <div className="flex items-end gap-2">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={variable.required}
                                onChange={(e) =>
                                  updateVariable(index, {
                                    required: e.target.checked,
                                  })
                                }
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              Required
                            </label>
                            <button
                              onClick={() => removeVariable(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <input
                              type="text"
                              value={variable.description}
                              onChange={(e) =>
                                updateVariable(index, {
                                  description: e.target.value,
                                })
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Variable description"
                            />
                          </div>

                          {variable.type === "select" && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Options (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={variable.options?.join(", ") || ""}
                                onChange={(e) =>
                                  updateVariable(index, {
                                    options: e.target.value
                                      .split(",")
                                      .map((s) => s.trim())
                                      .filter(Boolean),
                                  })
                                }
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Option 1, Option 2, Option 3"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {viewMode === "preview" && selectedTemplate && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-gray-600 mt-1">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewMode("list")}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    {onSelectTemplate && (
                      <button
                        onClick={() => {
                          const instance: TemplateInstance = {
                            templateId: selectedTemplate.id,
                            variables: templateVariables,
                            resolvedPrompt: previewPrompt,
                          };
                          onSelectTemplate(instance);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Use Template
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Variables */}
                  {selectedTemplate.variables.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">
                        Variables
                      </h4>
                      <div className="space-y-4">
                        {selectedTemplate.variables.map((variable) => (
                          <div key={variable.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {variable.description || variable.name}
                              {variable.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </label>

                            {variable.type === "textarea" ? (
                              <textarea
                                value={templateVariables[variable.name] || ""}
                                onChange={(e) =>
                                  setTemplateVariables((prev) => ({
                                    ...prev,
                                    [variable.name]: e.target.value,
                                  }))
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                                placeholder={variable.defaultValue}
                              />
                            ) : variable.type === "select" ? (
                              <select
                                value={templateVariables[variable.name] || ""}
                                onChange={(e) =>
                                  setTemplateVariables((prev) => ({
                                    ...prev,
                                    [variable.name]: e.target.value,
                                  }))
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">Select an option</option>
                                {variable.options?.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type={
                                  variable.type === "number" ? "number" : "text"
                                }
                                value={templateVariables[variable.name] || ""}
                                onChange={(e) =>
                                  setTemplateVariables((prev) => ({
                                    ...prev,
                                    [variable.name]:
                                      variable.type === "number"
                                        ? Number(e.target.value)
                                        : e.target.value,
                                  }))
                                }
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={variable.defaultValue}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      Preview
                    </h4>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                        {previewPrompt ||
                          "Configure variables to see preview..."}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
