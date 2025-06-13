"use client";
import { AlertCircle, Info, Sparkles, TriangleAlert } from "lucide-react";
import { ReactNode } from "react";

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
