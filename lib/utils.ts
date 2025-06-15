import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a human readable size string to megabytes.
 * Supports values like "1GB", "500MB" or "7B" (parameters).
 */
export function parseSize(value: string | undefined): number {
  if (!value || typeof value !== "string") return 0;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 0;
  const upper = value.toUpperCase();
  if (upper.includes("GB")) return num * 1024;
  if (upper.includes("MB")) return num;
  return num; // fallback
}
