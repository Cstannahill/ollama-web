import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "secondary" | "default";
}

export const Badge = ({ className, variant = "default", ...props }: BadgeProps) => {
  const base = variant === "secondary" ? "bg-gray-200 text-black" : "bg-ollama-green text-white";
  return <span className={cn("rounded px-2 py-1 text-xs", base, className)} {...props} />;
};
