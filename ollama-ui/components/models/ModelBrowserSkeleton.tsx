"use client";
import { ModelCardSkeleton } from "./ModelCardSkeleton";

export const ModelBrowserSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <ModelCardSkeleton key={i} />
    ))}
  </div>
);
