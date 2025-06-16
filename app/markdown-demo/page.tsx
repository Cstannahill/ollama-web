"use client";

import { FullMarkdownViewer } from "@/components/markdown/FullMarkdownViewer";

const DEMO_CONTENT = `# Ollama Web Documentation

Welcome to the comprehensive guide for setting up and using Ollama Web, a powerful AI-powered web interface for local language models.

## Basic Configuration

Configure your Ollama Web instance with these essential settings:

\`\`\`javascript
// ollama-web.config.js
const { defineConfig } = require('@ollama/web');

module.exports = defineConfig({
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    }
  },
  ollama: {
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    timeout: 30000,
    models: {
      default: 'llama3.2',
      available: ['llama3.2', 'codellama', 'qwen2.5', 'phi3']
    }
  },
  features: {
    agentic: true,
    vectorStore: true,
    conversationIndexing: true,
    markdown: {
      enhanced: true,
      mermaid: true,
      mathSupport: true
    }
  }
});
\`\`\`

\`\`\`typescript
// ollama-web.config.ts
import { defineConfig } from '@ollama/web';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    cors: {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
    }
  },
  ollama: {
    baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    timeout: 30000,
    models: {
      default: 'llama3.2' as const,
      available: ['llama3.2', 'codellama', 'qwen2.5', 'phi3'] as const
    }
  },
  features: {
    agentic: true,
    vectorStore: true,
    conversationIndexing: true,
    markdown: {
      enhanced: true,
      mermaid: true,
      mathSupport: true
    }
  }
});
\`\`\`

## Environment Variables

Create a \`.env\` file in your project root to configure environment-specific settings:

\`\`\`bash
# Server Configuration
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TIMEOUT=30000

# Vector Store Configuration
VECTOR_STORE_PATH=./data/vectors
EMBEDDING_MODEL=nomic-embed-text
RERANKING_MODEL=llama3.2

# Authentication (Optional)
JWT_SECRET=your-super-secret-jwt-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Database Configuration (Optional)
DATABASE_URL=mongodb://localhost:27017/ollama-web
REDIS_URL=redis://localhost:6379

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
\`\`\`

## Installation & Setup

Get started with Ollama Web in just a few steps:

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/ollama-web.git
cd ollama-web

# Install dependencies
yarn install
# or
npm install

# Copy environment file
cp .env.example .env

# Edit your environment variables
nano .env

# Start development server
yarn dev
# or
npm run dev

# Build for production
yarn build
yarn start
\`\`\`

## Features

### 🤖 Agentic Chat Mode

Ollama Web includes an advanced agentic chat mode that enables:

- **Intelligent reasoning** with step-by-step problem solving
- **Document retrieval** from your knowledge base
- **Multi-step workflows** for complex tasks
- **Tool integration** for enhanced capabilities

> **Note**: Agentic mode requires additional memory and processing power. Ensure your system meets the minimum requirements.

### 📊 Architecture Overview

\`\`\`mermaid
graph TB
    A[Client Browser] --> B[Next.js Frontend]
    B --> C[API Routes]
    C --> D[Ollama Server]
    C --> E[Vector Store]
    C --> F[Conversation Index]
    
    subgraph "Local AI Stack"
        D --> G[Language Models]
        E --> H[Embeddings]
        F --> I[Search Index]
    end
    
    subgraph "Data Storage"
        J[File System]
        K[Memory Cache]
        L[Session Store]
    end
    
    E --> J
    F --> J
    C --> K
    B --> L
\`\`\`

### 🔧 Model Management

| Model Name | Size | Capabilities | Best For |
|------------|------|--------------|----------|
| llama3.2 | 7B | General chat, reasoning | Daily conversations |
| codellama | 13B | Code generation, debugging | Programming tasks |
| qwen2.5 | 14B | Multilingual, math | Complex analysis |
| phi3 | 3.8B | Fast responses | Quick queries |

### 🚀 Performance Optimization

For optimal performance, consider these settings:

1. **Hardware Requirements**:
   - Minimum 16GB RAM
   - NVIDIA GPU with 8GB+ VRAM (optional)
   - SSD storage for faster model loading

2. **Model Selection**:
   - Use smaller models (3-7B) for faster responses
   - Use larger models (13B+) for complex reasoning
   - Consider quantized models for memory efficiency

3. **Configuration Tuning**:
   - Adjust \`temperature\` for creativity control
   - Set \`max_tokens\` to limit response length
   - Use \`stream: true\` for real-time responses

## API Reference

### Chat Completion

\`\`\`typescript
interface ChatRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

// Usage example
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'llama3.2',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    stream: true,
    temperature: 0.7
  })
});
\`\`\`

### Model Management

\`\`\`bash
# List available models
curl http://localhost:3000/api/models

# Pull a new model
curl -X POST http://localhost:3000/api/models/pull \\
  -H "Content-Type: application/json" \\
  -d '{"name": "qwen2.5"}'

# Delete a model
curl -X DELETE http://localhost:3000/api/models/llama3.2
\`\`\`

## Troubleshooting

### Common Issues

**Model not loading**:
- Check if Ollama is running: \`ollama list\`
- Verify model is pulled: \`ollama pull llama3.2\`
- Check disk space and memory usage

**Slow responses**:
- Monitor system resources
- Consider using smaller models
- Enable GPU acceleration if available

**Connection errors**:
- Verify \`OLLAMA_BASE_URL\` in environment
- Check firewall settings
- Ensure Ollama server is accessible

### Debug Mode

Enable debug logging by setting:

\`\`\`bash
LOG_LEVEL=debug
DEBUG=ollama:*
\`\`\`

This will provide detailed information about requests, model loading, and performance metrics.

---

*Documentation last updated: $(new Date().toLocaleDateString())*`;

export default function MarkdownDemoPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <FullMarkdownViewer 
        content={DEMO_CONTENT}
        title="Ollama Web Documentation"
        showSearch={true}
        showExport={true}
        showShare={true}
      />
    </div>
  );
}
