export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: PromptVariable[];
  category: PromptCategory;
  isBuiltIn: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptVariable {
  name: string;
  description: string;
  type: "text" | "number" | "select" | "textarea";
  defaultValue?: string;
  options?: string[]; // For select type
  required: boolean;
}

export type PromptCategory =
  | "general"
  | "coding"
  | "analysis"
  | "creative"
  | "research"
  | "support"
  | "custom";

export interface TemplateInstance {
  templateId: string;
  variables: Record<string, string | number>;
  resolvedPrompt: string;
}

export class PromptTemplateService {
  private static readonly STORAGE_KEY = "prompt-templates";
  private static readonly BUILT_IN_TEMPLATES: PromptTemplate[] = [
    {
      id: "general-assistant",
      name: "General Assistant",
      description: "A helpful and knowledgeable assistant",
      template: `You are a helpful, harmless, and honest AI assistant. Your goal is to provide accurate, useful information while being respectful and professional.

Personality traits:
- Helpful and supportive
- Clear and concise communication
- Professional but friendly tone

When responding:
- Be thorough but not verbose
- Ask clarifying questions when needed
- Admit when you don't know something`,
      variables: [],
      category: "general",
      isBuiltIn: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "coding-expert",
      name: "Coding Expert",
      description: "Specialized assistant for programming tasks",
      template: `You are an expert software developer with extensive knowledge in {{language}} and {{framework}}. Your expertise includes:

- Writing clean, maintainable code
- Following best practices and design patterns
- Code review and optimization
- Debugging and troubleshooting
- Architecture and system design

When helping with code:
- Provide working, tested examples
- Explain your reasoning
- Suggest improvements and alternatives
- Consider performance and security implications

Focus areas: {{focus_areas}}
Experience level: {{experience_level}}`,
      variables: [
        {
          name: "language",
          description: "Primary programming language",
          type: "select",
          options: [
            "JavaScript",
            "TypeScript",
            "Python",
            "Java",
            "C#",
            "Go",
            "Rust",
            "Other",
          ],
          defaultValue: "TypeScript",
          required: true,
        },
        {
          name: "framework",
          description: "Framework or technology stack",
          type: "text",
          defaultValue: "React/Next.js",
          required: false,
        },
        {
          name: "focus_areas",
          description:
            "Specific areas of focus (e.g., web dev, data science, AI/ML)",
          type: "textarea",
          defaultValue: "Web development, API design, database optimization",
          required: false,
        },
        {
          name: "experience_level",
          description: "Target experience level for explanations",
          type: "select",
          options: ["Beginner", "Intermediate", "Advanced", "Expert"],
          defaultValue: "Intermediate",
          required: true,
        },
      ],
      category: "coding",
      isBuiltIn: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "research-analyst",
      name: "Research Analyst",
      description: "Analytical assistant for research and data analysis",
      template: `You are a thorough research analyst specializing in {{research_domain}}. Your approach is methodical and evidence-based.

Research methodology:
- Systematic information gathering
- Critical evaluation of sources
- Balanced perspective considering multiple viewpoints
- Clear documentation of findings and limitations

When conducting analysis:
- Structure findings logically
- Cite relevant sources when available
- Distinguish between facts and interpretations
- Highlight areas needing further investigation
- Provide actionable insights

Research focus: {{research_focus}}
Analysis depth: {{analysis_depth}}`,
      variables: [
        {
          name: "research_domain",
          description: "Primary research domain",
          type: "select",
          options: [
            "Technology",
            "Business",
            "Academic",
            "Market Research",
            "Policy Analysis",
            "Other",
          ],
          defaultValue: "Technology",
          required: true,
        },
        {
          name: "research_focus",
          description: "Specific research focus areas",
          type: "textarea",
          defaultValue: "Current trends, best practices, emerging technologies",
          required: false,
        },
        {
          name: "analysis_depth",
          description: "Preferred depth of analysis",
          type: "select",
          options: ["Overview", "Detailed", "Comprehensive", "Expert-level"],
          defaultValue: "Detailed",
          required: true,
        },
      ],
      category: "research",
      isBuiltIn: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "creative-writer",
      name: "Creative Writer",
      description: "Assistant for creative writing and content creation",
      template: `You are a creative and imaginative writer specializing in {{writing_style}}. Your writing is engaging, original, and tailored to the intended audience.

Writing approach:
- Compelling narratives and clear structure
- Vivid descriptions and engaging language
- Appropriate tone for the target audience
- Original ideas and creative solutions

When creating content:
- Consider the target audience: {{target_audience}}
- Maintain consistent voice and style
- Use compelling examples and analogies
- Ensure clarity and readability
- Encourage engagement and action

Content type: {{content_type}}
Tone: {{tone}}`,
      variables: [
        {
          name: "writing_style",
          description: "Primary writing style",
          type: "select",
          options: [
            "Technical Writing",
            "Creative Fiction",
            "Marketing Copy",
            "Educational Content",
            "Blog Posts",
            "Academic Writing",
          ],
          defaultValue: "Blog Posts",
          required: true,
        },
        {
          name: "target_audience",
          description: "Target audience for the content",
          type: "text",
          defaultValue: "General audience",
          required: false,
        },
        {
          name: "content_type",
          description: "Type of content to create",
          type: "text",
          defaultValue: "Informative articles",
          required: false,
        },
        {
          name: "tone",
          description: "Preferred tone and style",
          type: "select",
          options: [
            "Professional",
            "Casual",
            "Friendly",
            "Authoritative",
            "Conversational",
            "Formal",
          ],
          defaultValue: "Conversational",
          required: true,
        },
      ],
      category: "creative",
      isBuiltIn: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  static getTemplates(): PromptTemplate[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const customTemplates = stored ? JSON.parse(stored) : [];

    // Deserialize dates
    customTemplates.forEach((template: any) => {
      template.createdAt = new Date(template.createdAt);
      template.updatedAt = new Date(template.updatedAt);
    });

    return [...this.BUILT_IN_TEMPLATES, ...customTemplates];
  }

  static getTemplate(id: string): PromptTemplate | undefined {
    return this.getTemplates().find((template) => template.id === id);
  }

  static saveTemplate(
    template: Omit<PromptTemplate, "id" | "createdAt" | "updatedAt">
  ): PromptTemplate {
    const newTemplate: PromptTemplate = {
      ...template,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const customTemplates = this.getCustomTemplates();
    customTemplates.push(newTemplate);
    this.saveCustomTemplates(customTemplates);

    return newTemplate;
  }

  static updateTemplate(
    id: string,
    updates: Partial<Omit<PromptTemplate, "id" | "isBuiltIn" | "createdAt">>
  ): boolean {
    const customTemplates = this.getCustomTemplates();
    const index = customTemplates.findIndex((template) => template.id === id);

    if (index === -1) return false;

    customTemplates[index] = {
      ...customTemplates[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.saveCustomTemplates(customTemplates);
    return true;
  }

  static deleteTemplate(id: string): boolean {
    const customTemplates = this.getCustomTemplates();
    const filtered = customTemplates.filter((template) => template.id !== id);

    if (filtered.length === customTemplates.length) return false;

    this.saveCustomTemplates(filtered);
    return true;
  }

  static resolveTemplate(
    templateId: string,
    variables: Record<string, string | number>
  ): string {
    const template = this.getTemplate(templateId);
    if (!template) throw new Error(`Template not found: ${templateId}`);

    let resolved = template.template;

    // Replace variables in the format {{variable_name}}
    template.variables.forEach((variable) => {
      const value = variables[variable.name] ?? variable.defaultValue ?? "";
      const regex = new RegExp(`\\{\\{${variable.name}\\}\\}`, "g");
      resolved = resolved.replace(regex, String(value));
    });

    // Remove any remaining unresolved variables
    resolved = resolved.replace(/\{\{[^}]+\}\}/g, "");

    return resolved.trim();
  }

  static validateVariables(
    templateId: string,
    variables: Record<string, string | number>
  ): { isValid: boolean; errors: string[] } {
    const template = this.getTemplate(templateId);
    if (!template) return { isValid: false, errors: ["Template not found"] };

    const errors: string[] = [];

    template.variables.forEach((variable) => {
      if (
        variable.required &&
        !variables[variable.name] &&
        !variable.defaultValue
      ) {
        errors.push(`Required variable "${variable.name}" is missing`);
      }

      if (
        variable.type === "select" &&
        variable.options &&
        variables[variable.name]
      ) {
        const value = String(variables[variable.name]);
        if (!variable.options.includes(value)) {
          errors.push(`Invalid value for "${variable.name}": ${value}`);
        }
      }

      if (variable.type === "number" && variables[variable.name]) {
        const value = variables[variable.name];
        if (typeof value !== "number" && isNaN(Number(value))) {
          errors.push(`"${variable.name}" must be a number`);
        }
      }
    });

    return { isValid: errors.length === 0, errors };
  }

  static getTemplatesByCategory(category: PromptCategory): PromptTemplate[] {
    return this.getTemplates().filter(
      (template) => template.category === category
    );
  }

  static exportTemplates(): string {
    const customTemplates = this.getCustomTemplates();
    return JSON.stringify(customTemplates, null, 2);
  }

  static importTemplates(jsonData: string): {
    success: boolean;
    imported: number;
    errors: string[];
  } {
    try {
      const templates = JSON.parse(jsonData);
      if (!Array.isArray(templates)) {
        return {
          success: false,
          imported: 0,
          errors: ["Invalid format: expected array"],
        };
      }

      const errors: string[] = [];
      let imported = 0;

      templates.forEach((template, index) => {
        try {
          const validated = this.validateTemplateStructure(template);
          if (validated) {
            // Generate new ID to avoid conflicts
            const newTemplate = {
              ...validated,
              id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              isBuiltIn: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const customTemplates = this.getCustomTemplates();
            customTemplates.push(newTemplate);
            this.saveCustomTemplates(customTemplates);
            imported++;
          }
        } catch (error) {
          errors.push(
            `Template ${index + 1}: ${error instanceof Error ? error.message : "Invalid format"}`
          );
        }
      });

      return { success: errors.length === 0, imported, errors };
    } catch (error) {
      return { success: false, imported: 0, errors: ["Invalid JSON format"] };
    }
  }

  private static getCustomTemplates(): PromptTemplate[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return [];

    const templates = JSON.parse(stored);
    // Deserialize dates
    templates.forEach((template: any) => {
      template.createdAt = new Date(template.createdAt);
      template.updatedAt = new Date(template.updatedAt);
    });

    return templates;
  }

  private static saveCustomTemplates(templates: PromptTemplate[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(templates));
  }

  private static validateTemplateStructure(
    template: any
  ): PromptTemplate | null {
    if (!template || typeof template !== "object") return null;

    const required = ["name", "template", "category"];
    for (const field of required) {
      if (!template[field]) return null;
    }

    return {
      id: template.id || "temp",
      name: template.name,
      description: template.description || "",
      template: template.template,
      variables: Array.isArray(template.variables) ? template.variables : [],
      category: template.category,
      isBuiltIn: false,
      createdAt: template.createdAt ? new Date(template.createdAt) : new Date(),
      updatedAt: template.updatedAt ? new Date(template.updatedAt) : new Date(),
    };
  }
}
