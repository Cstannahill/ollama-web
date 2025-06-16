# Agentic Chat

This directory documents the optional agentic chat mode that uses the LangChain pipeline and vector store to produce context-aware responses.

- See [overview.md](overview.md) for architecture diagrams and a breakdown of UI flows.
- Relevant types are defined in [`/types/chat`](../../types/chat) and [`/types/vector`](../../types/vector).
- Core components live under `components/chat` and interact with services in `src/lib`.
- Additional ideas are collected in [enhancements.md](enhancements.md).
