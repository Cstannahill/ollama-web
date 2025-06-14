# LangChain Agent Pipeline

## Feature Purpose and Scope


Provide a modular pipeline for retrieval augmented generation (RAG) using LangChain. The pipeline handles embeddings, history trimming, vector search, **context summarisation**, reranking and prompt assembly before streaming results from Ollama. Each step emits progress events so the UI can display the agent's current action. A separate "thinking" output exposes a short summary of the pipeline's reasoning which can be expanded in the chat UI. After the model responds, a lightweight summariser step generates a short overview for quick reference. Retrieved documents are emitted so the interface can show which context was used, and completed conversations are stored back into the vector store for future queries.



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
  Appropriately merge the two Q --> E --> R --> RR --> P --> C --> S + Q --> H --> E --> R --> RR --> P --> C --> T((Tokens))
```mermaid
flowchart TD
    subgraph Pipeline
        Q[Query]
        H[HistoryTrimmer]
        E[EmbeddingService]
        R[VectorStoreRetriever]
        RR[RerankerService]
        S[ContextSummarizer]
        P[PromptBuilder]
        C[OllamaChat]

        S[ResponseSummariser]
    end
    
    Q --> E --> R --> RR --> P --> C --> S

    Q --> H --> E --> R --> RR --> P --> C --> T((Tokens))

        L[ResponseLogger]
    end
    Q --> E --> R --> RR --> S --> P --> C --> L

```

## Future Agentic Operations

- **Long-Term Memory Store** – persisting condensed conversation summaries for efficient retrieval across sessions.
- **Conditional Tool Invocation** – dynamically choose which tools to run based on the query intent or intermediate results.
- **Query Rewriting**: dynamically reformulate user questions for better retrieval.
- **External API tools**: integrate web search or data-fetching functions for enriched answers.
- **Response rating**: solicit quick thumbs-up/down to improve future results.
- **Automatic summarization**: store brief summaries of long chats for efficient recall.
