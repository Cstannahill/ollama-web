import { cn } from "@/lib/utils";

export const Progress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div
    className={cn("w-full h-1 bg-gray-200 rounded", className)}
    role="progressbar"
    aria-valuenow={Math.round(value)}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <div
      className="h-1 bg-ollama-green rounded"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
