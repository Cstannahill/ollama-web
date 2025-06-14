export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Convert a human readable size string to megabytes.
 * Supports values like "1GB", "500MB" or "7B" (parameters).
 */
export function parseSize(value: string | undefined): number {
  if (!value) return 0;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 0;
  const upper = value.toUpperCase();
  if (upper.includes('GB')) return num * 1024;
  if (upper.includes('MB')) return num;
  return num; // fallback
}
