import { Card } from "@/components/ui";

export const LandingHero = () => {
  return (
    <section className="relative flex flex-col items-center text-center py-20 md:py-32 gap-8">
      <h1 className="text-4xl font-bold">Welcome to Ollama Web</h1>
      <p className="text-gray-600 dark:text-gray-300 max-w-xl">
        Manage local models and chat with them directly in your browser.
      </p>
      <div className="relative mt-12 grid gap-6 sm:grid-cols-3">
        <Card className="p-6 shadow-lg hover:-translate-y-1 transition-transform">
          <h3 className="font-semibold mb-2">Browse Models</h3>
          <p className="text-sm text-muted-foreground">
            Explore available models and view stats at a glance.
          </p>
        </Card>
        <Card className="p-6 shadow-lg hover:-translate-y-1 transition-transform">
          <h3 className="font-semibold mb-2">Chat Locally</h3>
          <p className="text-sm text-muted-foreground">
            Converse with your selected model using rich Markdown.
          </p>
        </Card>
        <Card className="p-6 shadow-lg hover:-translate-y-1 transition-transform">
          <h3 className="font-semibold mb-2">Tune Settings</h3>
          <p className="text-sm text-muted-foreground">
            Customize download paths and preferences.
          </p>
        </Card>
      </div>
    </section>
  );
};
