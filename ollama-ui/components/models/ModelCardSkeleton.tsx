"use client";
import { Card } from "@/components/ui/card";

export const ModelCardSkeleton = () => (
  <Card className="overflow-hidden animate-pulse border-white/10">
    <div className="h-32 bg-muted" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-3 bg-muted rounded w-1/2" />
      <div className="h-8 bg-muted rounded" />
    </div>
  </Card>
);
