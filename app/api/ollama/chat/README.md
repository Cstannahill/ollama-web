# /api/ollama/chat API Route

This route proxies chat requests from the frontend to the agentic chat pipeline logic in the backend. It supports advanced agentic flows, context retrieval, and can be extended for streaming or websocket support.

- POST requests should include `{ messages: Message[], settings: ChatSettings }` in the body.
- The handler delegates to `lib/ollama/agenticHandler.ts` and `services/agentic-chat-api.ts`.
- For websocket support, see `ws.ts` in this directory.
