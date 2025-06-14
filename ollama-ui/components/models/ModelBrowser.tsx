"use client";
import { useState, useMemo, useRef } from "react";
import Fuse from "fuse.js";
import { Model, ModelFilters } from "@/types";
import { ModelCard } from "./ModelCard";
import { parseSize } from "@/lib/utils";

interface Props {
  models: Model[];
  onSelect?: (model: Model) => void;
}

const defaultFilters: ModelFilters = {
  query: "",
  categories: [],
  sizeRange: [0, Infinity],
  sort: "popular",
};

export const ModelBrowser = ({ models, onSelect }: Props) => {
  const [filters, setFilters] = useState<ModelFilters>(defaultFilters);
  const fuseRef = useRef<Fuse<Model> | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => m.capabilities?.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [models]);

  const results = useMemo(() => {
    let items = models;
    if (!fuseRef.current) {
      fuseRef.current = new Fuse(models, {
        keys: ["name", "description"],
        threshold: 0.4,
      });
    }
    if (filters.query) {
      items = fuseRef.current.search(filters.query).map((r) => r.item);
    }
    if (filters.categories && filters.categories.length) {
      items = items.filter((m) =>
        m.capabilities?.some((c) => filters.categories!.includes(c)),
      );
    }
    if (filters.sizeRange) {
      items = items.filter((m) => {
        const s = parseSize(m.size);
        return s >= filters.sizeRange![0] && s <= filters.sizeRange![1];
      });
    }
    switch (filters.sort) {
      case "size":
        items = [...items].sort((a, b) => parseSize(a.size) - parseSize(b.size));
        break;
      case "performance":
        items = [...items].sort(
          (a, b) =>
            parseFloat(b.performance || "0") - parseFloat(a.performance || "0"),
        );
        break;
      default:
        break;
    }
    return items;
  }, [models, filters]);

  const toggleCategory = (cat: string) => {
    setFilters((f) => {
      const cats = f.categories || [];
      return {
        ...f,
        categories: cats.includes(cat)
          ? cats.filter((c) => c !== cat)
          : [...cats, cat],
      };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <input
          placeholder="Search models"
          aria-label="Search models"
          className="flex-1 border px-2 py-1 rounded-md bg-background"
          value={filters.query}
          onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        />
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={filters.categories?.includes(cat)}
                onChange={() => toggleCategory(cat)}
              />
              {cat}
            </label>
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <span>Size &gt;=</span>
          <input
            type="number"
            className="w-16 border px-1 py-0.5 rounded-md"
            value={filters.sizeRange?.[0] || 0}
            aria-label="Minimum size in MB"
            onChange={(e) =>
              setFilters({
                ...filters,
                sizeRange: [Number(e.target.value), filters.sizeRange?.[1] ?? Infinity],
              })
            }
          />
          <span>MB</span>
        </div>
        <select
          className="border px-2 py-1 rounded-md"
          value={filters.sort}
          aria-label="Sort models"
          onChange={(e) =>
            setFilters({ ...filters, sort: e.target.value as ModelFilters["sort"] })
          }
        >
          <option value="popular">Popular</option>
          <option value="recent">Recent</option>
          <option value="size">Size</option>
          <option value="performance">Performance</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {results.map((m) => (
          <ModelCard key={m.id} model={m} onSelect={onSelect || (() => {})} />
        ))}
      </div>
    </div>
  );
};
