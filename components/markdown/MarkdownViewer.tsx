"use client";

import React from "react";
import { EnhancedTabCodeBlock } from "./EnhancedTabCodeBlock";

interface ConfigurationSection {
  title: string;
  tabs: Array<{
    id: string;
    label: string;
    language: string;
    code: string;
  }>;
}

interface MarkdownViewerProps {
  content: string;
  className?: string;
}

export function MarkdownViewer({ content, className = "" }: MarkdownViewerProps) {
  // Parse markdown content into structured sections
  const parseContent = (markdown: string): ConfigurationSection[] => {
    const sections: ConfigurationSection[] = [];
    const lines = markdown.split('\n');
    let currentSection: ConfigurationSection | null = null;
    let currentCodeBlock = '';
    let currentLanguage = '';
    let inCodeBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for section headers (## or #)
      if (line.startsWith('## ') || line.startsWith('# ')) {
        // Save previous section if it exists
        if (currentSection && currentSection.tabs.length > 0) {
          sections.push(currentSection);
        }
        
        // Start new section
        currentSection = {
          title: line.replace(/^#+\s*/, ''),
          tabs: []
        };
        continue;
      }

      // Check for code block start
      if (line.startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          currentLanguage = line.replace('```', '') || 'text';
          currentCodeBlock = '';
        } else {
          // End of code block
          inCodeBlock = false;
          if (currentSection) {
            // Determine tab label based on language
            let label = currentLanguage.toUpperCase();
            if (currentLanguage === 'javascript' || currentLanguage === 'js') label = 'JavaScript';
            if (currentLanguage === 'typescript' || currentLanguage === 'ts') label = 'TypeScript';
            if (currentLanguage === 'bash' || currentLanguage === 'sh') label = 'BASH';
            if (currentLanguage === 'json') label = 'JSON';

            currentSection.tabs.push({
              id: `${currentSection.title.toLowerCase().replace(/\s+/g, '-')}-${currentLanguage}`,
              label,
              language: currentLanguage,
              code: currentCodeBlock.trim()
            });
          }
          currentCodeBlock = '';
          currentLanguage = '';
        }
        continue;
      }

      // Collect code block content
      if (inCodeBlock) {
        currentCodeBlock += (currentCodeBlock ? '\n' : '') + line;
      }
    }

    // Don't forget the last section
    if (currentSection && currentSection.tabs.length > 0) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = parseContent(content);

  return (
    <div className={`space-y-6 ${className}`}>
      {sections.map((section, index) => (
        <EnhancedTabCodeBlock
          key={index}
          title={section.title}
          tabs={section.tabs}
        />
      ))}
    </div>
  );
}

// Example usage content generator for testing
export function generateExampleContent(): string {
  return `# Basic Configuration

\`\`\`javascript
// Farm config.js
const { defineConfig } = require('@farm/core');

module.exports = defineConfig({
  database: {
    provider: 'mongodb',
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/farm-app'
  },
  ai: {
    provider: 'ollama',
    models: ['llama3.2', 'codellama']
  },
  auth: {
    providers: ['github', 'google'],
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d'
    }
  }
});
\`\`\`

\`\`\`typescript
// Farm config.ts
import { defineConfig } from '@farm/core';

export default defineConfig({
  database: {
    provider: 'mongodb',
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/farm-app'
  },
  ai: {
    provider: 'ollama',
    models: ['llama3.2', 'codellama']
  },
  auth: {
    providers: ['github', 'google'],
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d'
    }
  }
});
\`\`\`

# Environment Variables

Create a \`.env\` file in your project root:

\`\`\`bash
# Database
DATABASE_URL=mongodb://localhost:27017/farm-app

# Authentication
JWT_SECRET=your-super-secret-jwt-key
GITHUB_CLIENT_ID=your-github-client-id
\`\`\`

# Getting Started

\`\`\`bash
# Install Farm CLI
npm install -g @farm/cli

# Create new project
farm create my-app
cd my-app

# Start development server
farm dev
\`\`\``;
}
