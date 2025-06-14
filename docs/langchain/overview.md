# LangChain Agent Pipeline

## Feature Purpose and Scope

Provide a modular pipeline for retrieval augmented generation (RAG) using LangChain. The pipeline handles embeddings, vector search, reranking, **context summarisation**, and prompt assembly before streaming results from Ollama. Each step emits progress events so the UI can display the agent's current action.

## Core Flows and UI Touchpoints

- Pipeline created in `useChatStore` with current `ChatSettings`.
- Messages and progress updates streamed from the pipeline directly into the chat UI.

## Primary Types/Interfaces

- Interfaces under [`/types/langchain`](../../types/langchain).
- `ChatSettings` from [`/types/settings`](../../types/settings).

## Key Dependencies and Related Modules

- `VectorStoreService` for document retrieval.
- `EmbeddingService` and `RerankerService` for search quality.
- LangChain `RunnableSequence` for composition.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Pipeline
        Q[Query]
        E[EmbeddingService]
        R[VectorStoreRetriever]
        RR[RerankerService]
        S[ContextSummarizer]
        P[PromptBuilder]
        C[OllamaChat]
    end
    Q --> E --> R --> RR --> S --> P --> C
```

## Future Agentic Operations

- **Query Rewriting**: dynamically reformulate user questions for better retrieval.
- **External API tools**: integrate web search or data-fetching functions for enriched answers.

