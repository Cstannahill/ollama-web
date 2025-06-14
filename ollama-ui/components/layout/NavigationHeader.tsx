import Link from "next/link";
import { ThemeToggle } from "@/components/ui";
import { getOllamaStatus } from "@/lib/ollama/server";

export default async function NavigationHeader() {
  const status = await getOllamaStatus();
  const statusColor = status.connected ? "bg-green-500" : "bg-red-500";
  return (
    <header className="border-b px-4 py-3 bg-background/60 backdrop-blur flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-semibold">
          Ollama Web
        </Link>
        <span
          className={`w-2 h-2 rounded-full ${statusColor} animate-pulse`}
          title={status.connected ? `Ollama ${status.version}` : "Offline"}
        />
      </div>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/models" className="hover:underline">
          Models
        </Link>
        <Link href="/chat" className="hover:underline">
          Chat
        </Link>
        <Link href="/settings" className="hover:underline">
          Settings
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}
