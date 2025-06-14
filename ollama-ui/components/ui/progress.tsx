export const Progress = ({ value }: { value: number }) => (
  <div className="w-full h-1 bg-gray-200 rounded" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
    <div
      className="h-1 bg-ollama-green rounded"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
