export const Progress = ({ value }: { value: number }) => (
  <div className="w-full h-1 bg-gray-200 rounded">
    <div
      className="h-1 bg-ollama-green rounded"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
