"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  MessageSquare,
  Brain,
  Zap,
  ArrowRight,
  Github,
  Sparkles,
} from "@/components/ui/icons";

// Additional icons for features
const Shield = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const Database = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
    />
  </svg>
);

const features = [
  {
    name: "Lightning Fast",
    description:
      "Optimized for speed with intelligent caching and streaming responses.",
    icon: Zap,
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    name: "Local & Private",
    description:
      "Your conversations stay on your machine. Complete privacy and control.",
    icon: Shield,
    gradient: "from-green-400 to-emerald-500",
  },
  {
    name: "Smart Context",
    description:
      "Advanced RAG pipeline with vector search for contextual conversations.",
    icon: Database,
    gradient: "from-blue-400 to-cyan-500",
  },
  {
    name: "Multi-Modal",
    description:
      "Support for text, code, and documents with rich markdown rendering.",
    icon: Sparkles,
    gradient: "from-purple-400 to-pink-500",
  },
];

export const LandingHero = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/50">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            {" "}
            <Badge variant="secondary" className="mb-8 px-4 py-2">
              <Sparkles className="mr-2 h-4 w-4" />
              New: Advanced Agentic Chat Mode
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Build faster with{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Ollama Web
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              The modern full-stack framework combining local AI, advanced RAG,
              and beautiful UX. Ship production-ready applications in minutes,
              not months.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {" "}
              <Button asChild size="lg" className="text-base">
                <Link href="/chat/new">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base" asChild>
                <Link
                  href="https://github.com/your-repo"
                  className="flex items-center"
                >
                  <Github className="mr-2 h-4 w-4" />
                  View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-secondary to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-base font-semibold leading-7 text-primary">
              Everything you need
            </h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to build modern apps
            </p>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Ollama Web provides a complete toolkit for building scalable,
              production-ready applications.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2 xl:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={feature.name}
                    className="relative overflow-hidden border-0 bg-card/50 backdrop-blur-sm"
                  >
                    <div className="p-6">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${feature.gradient} mb-4`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <dt className="text-base font-semibold leading-7">
                        {feature.name}
                      </dt>
                      <dd className="mt-2 text-base leading-7 text-muted-foreground">
                        {feature.description}
                      </dd>
                    </div>
                  </Card>
                );
              })}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative isolate">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <Card className="relative overflow-hidden border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
            <div className="px-6 py-16 sm:px-16 sm:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Ready to get started?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                  Start building with Ollama Web today. No setup required.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  {" "}
                  <Button asChild size="lg">
                    <Link href="/chat/new">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Start Chatting
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/models">
                      <Brain className="mr-2 h-4 w-4" />
                      Browse Models
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
