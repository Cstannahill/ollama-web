"use client";
import { ReactNode } from "react";

// Custom icons to avoid lucide-react issues
const Info = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AlertCircle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

const Sparkles = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3l1.5 1.5L5 6l-1.5-1.5L5 3zM19 3l1.5 1.5L19 6l-1.5-1.5L19 3zM12 8l2 2-2 2-2-2 2-2zM5 17l1.5 1.5L5 20l-1.5-1.5L5 17zM19 17l1.5 1.5L19 20l-1.5-1.5L19 17z"
    />
  </svg>
);

const TriangleAlert = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
    />
  </svg>
);

export type CalloutType = "note" | "warning" | "tip" | "error";

interface CalloutProps {
  type: CalloutType;
  children: ReactNode;
}

export const Callout = ({ type, children }: CalloutProps) => {
  const icons = {
    note: Info,
    warning: TriangleAlert,
    tip: Sparkles,
    error: AlertCircle,
  };
  const Icon = icons[type];

  const colors: Record<CalloutType, string> = {
    note: "border-blue-400 bg-blue-950/40",
    warning: "border-yellow-400 bg-yellow-950/40",
    tip: "border-green-400 bg-green-950/40",
    error: "border-red-400 bg-red-950/40",
  };

  return (
    <div className={`flex gap-3 p-3 my-4 border-l-4 rounded ${colors[type]}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
};
