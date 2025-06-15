# /api/ollama API

This directory contains API routes for proxying and handling advanced Ollama and agentic chat flows.

- `/api/ollama/chat` — Main REST endpoint for agentic chat (POST only)
- `/api/ollama/chat/ws` — Websocket endpoint for streaming agentic chat (experimental)

All logic is routed through `lib/ollama/agenticHandler.ts` and `services/agentic-chat-api.ts` for maintainability and extensibility.
