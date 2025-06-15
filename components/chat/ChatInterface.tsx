"use client";
import { useEffect, useRef } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ConversationHeader } from "./ConversationHeader";
import { useChatStore } from "@/stores/chat-store";
import { useConversationStore } from "@/stores/conversation-store";
import { ThemeToggle, Button, Spinner, Progress, Toast } from "@/components/ui";
import { ExportMenu } from "./ExportMenu";
import { ModeSelector } from "./ModeSelector";
import { ModeInfo } from "./ModeInfo";
import { AgenticProcessIndicator } from "./AgenticProcessIndicator";
import { EnhancedChatSettings } from "./EnhancedChatSettings";
import { TypingIndicator } from "./TypingIndicator";
import { AgentStatus } from "./AgentStatus";
import { AgentThinking } from "./AgentThinking";
import { AgentSummary } from "./AgentSummary";
import { AgentError } from "./AgentError";
import { TokenInfo } from "./TokenInfo";
import { AgentDocs } from "./AgentDocs";
import { AgentToolOutput } from "./AgentToolOutput";

export const ChatInterface = ({ threadId }: { threadId?: string }) => {
  const {
    messages,
    isStreaming,
    sendMessage,
    stop,
    status,
    tokens,
    error,
    setError,
    setMode,
  } = useChatStore();

  const { getActiveConversation, activeConversationId, setActiveConversation } =
    useConversationStore();

  const bottomRef = useRef<HTMLDivElement>(null);
  const statusOrder = [
    "Embedding query",
    "Retrieving documents",
    "Reranking results",
    "Summarizing context",
    "Building prompt",
    "Invoking model",
    "Completed",
  ];
  const idx = statusOrder.indexOf(status ?? "");
  const progress = idx >= 0 ? ((idx + 1) / statusOrder.length) * 100 : 0;

  // Set active conversation based on threadId from URL
  useEffect(() => {
    if (threadId && threadId !== activeConversationId) {
      setActiveConversation(threadId);
    }
  }, [threadId, activeConversationId, setActiveConversation]);

  // Load conversation messages when active conversation changes
  useEffect(() => {
    const activeConversation = getActiveConversation();
    if (activeConversation) {
      // Update chat store with conversation messages and mode
      useChatStore.setState({
        messages: activeConversation.messages,
      });
      setMode(activeConversation.mode);
    } else {
      // Clear messages if no active conversation
      useChatStore.setState({ messages: [] });
    }
  }, [activeConversationId, getActiveConversation, setMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status, tokens]);
  return (
    <div className="flex flex-col h-full">
      {/* Top Header */}
      <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center gap-4">
          {" "}
          <div className="flex items-center gap-3">
            <ExportMenu />
            <ModeSelector />
            <EnhancedChatSettings />
          </div>
          <div className="flex items-center gap-3">
            {status && (
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-medium flex items-center gap-1 ${
                    status.toLowerCase().includes("failed")
                      ? "text-destructive"
                      : status === "Completed"
                        ? "text-green-600"
                        : "text-muted-foreground"
                  }`}
                >
                  {isStreaming && <Spinner className="w-3 h-3" />}
                  {status}
                </span>
              </div>
            )}
            {isStreaming && (
              <Button variant="outline" size="sm" onClick={stop}>
                Stop
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Conversation Header */}
      <ConversationHeader />

      {/* Progress Bar */}
      {isStreaming && <Progress value={progress} />}

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-4 max-w-6xl mx-auto w-full"
        role="log"
        aria-live="polite"
      >
        {" "}
        {messages.length === 0 ? (
          <ModeInfo />
        ) : (
          <>
            <AgenticProcessIndicator />{" "}
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} />
            ))}
            {isStreaming && <TypingIndicator />}
            <AgentStatus />
            <AgentDocs />
            <AgentToolOutput />
            <AgentThinking />
            <AgentError />
            <AgentSummary />
            <TokenInfo />
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      <ChatInput onSend={sendMessage} disabled={isStreaming} />

      {/* Error Toast */}
      {error && <Toast message={error} onDismiss={() => setError(null)} />}
    </div>
  );
};
