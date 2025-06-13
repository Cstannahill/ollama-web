import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
  size?: "icon" | "default";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const base = variant === "outline" ? "border" : "bg-ollama-green text-white";
    const padding = size === "icon" ? "p-2" : "px-3 py-2";
    return (
      <button ref={ref} className={cn("rounded", base, padding, className)} {...props} />
    );
  },
);
Button.displayName = "Button";
