# Ollama Web Interface

This repository hosts a Next.js application that provides a polished web interface for running local Ollama models. Each feature is documented under the `docs` directory with diagrams and type references.

## Getting Started

1. Install dependencies with `pnpm install`.
2. Build the UI using `pnpm --filter ollama-ui build`.
3. Run the development server:
   ```bash
   pnpm --filter ollama-ui dev
   ```

## Features

- **Model Browser** – explore available models and start downloads.
- **Chat Interface** – simple messaging with Markdown rendering.
- **Agentic Chat** – optional mode that leverages a vector store and LangChain pipeline.
- **Export** – save conversations to Markdown, PDF or JSON.
- **Settings** – configure download paths and chat parameters.

See `docs/README.md` for links to feature documentation.
