# Documentation Overview

This folder contains feature-focused documentation for the Ollama web interface. Each subdirectory describes a major domain of the application.

- **agentic-chat/** – advanced chat mode powered by vector search and LangChain agents.
- **chat/** – basic conversation interface rendering assistant responses as Markdown.
- **export/** – saving conversations to Markdown, PDF or JSON.
- **langchain/** – the retrieval augmented generation pipeline.
- **markdown/** – renderer for rich assistant Markdown output.
- **model-browser/** – browsing models available from the local Ollama server.
- **model-download/** – download manager handling progress updates.
- **ollama-connection/** – service for communicating with the Ollama backend.
- **settings/** – user preferences such as paths and chat parameters.
- **vector-store/** – local vector database used for context retrieval.
- **layout/** – shared navigation header and page shell.

Refer to each directory's `README.md` and `overview.md` for diagrams, types and implementation notes.
