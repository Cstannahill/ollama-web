"use client";

// Custom typing indicator component for streaming messages
export const TypingIndicator = () => {
  return (
    <div className="flex w-full justify-start">
      <div className="max-w-4xl w-full mr-8">
        <div className="bg-muted/50 text-foreground px-4 py-3 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm text-muted-foreground">
              AI is thinking...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
