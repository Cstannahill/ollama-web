import { getOllamaStatus } from "@/lib/ollama/server";

export default async function Header() {
  const status = await getOllamaStatus();
  return (
    <header className="p-4 border-b flex justify-between items-center">
      <span className="font-semibold">Ollama Web</span>
      <span className={status.connected ? "text-green-600" : "text-red-600"}>
        {status.connected ? `Connected (${status.version})` : "Offline"}
      </span>
    </header>
  );
}
