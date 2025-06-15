"use client";

import { useState } from "react";
import { useConversationStore } from "@/stores/conversation-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom icons
const Search = ({ className }: { className?: string }) => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const Filter = ({ className }: { className?: string }) => (
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
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.121A1 1 0 013 6.414V4z"
    />
  </svg>
);

const X = ({ className }: { className?: string }) => (
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
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

type FilterType =
  | "all"
  | "simple"
  | "agentic"
  | "pinned"
  | "today"
  | "week"
  | "month";

export const ConversationSearch = () => {
  const { searchQuery, setSearchQuery, conversations } = useConversationStore();
  const [activeFilters, setActiveFilters] = useState<FilterType[]>(["all"]);

  // Get all unique tags from conversations
  const allTags = Array.from(
    new Set(conversations.flatMap((conv) => conv.tags || []))
  ).sort();

  const addFilter = (filter: FilterType) => {
    if (filter === "all") {
      setActiveFilters(["all"]);
    } else {
      const newFilters = activeFilters.filter((f) => f !== "all");
      if (!newFilters.includes(filter)) {
        setActiveFilters([...newFilters, filter]);
      }
    }
  };

  const removeFilter = (filter: FilterType) => {
    const newFilters = activeFilters.filter((f) => f !== filter);
    setActiveFilters(newFilters.length === 0 ? ["all"] : newFilters);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveFilters(["all"]);
  };

  const getFilterLabel = (filter: FilterType): string => {
    switch (filter) {
      case "all":
        return "All";
      case "simple":
        return "Simple Mode";
      case "agentic":
        return "Agentic Mode";
      case "pinned":
        return "Pinned";
      case "today":
        return "Today";
      case "week":
        return "This Week";
      case "month":
        return "This Month";
      default:
        return filter;
    }
  };

  const hasActiveSearch =
    searchQuery.trim() || activeFilters.some((f) => f !== "all");

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {hasActiveSearch && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Filter Dropdown */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <Filter className="w-3 h-3 mr-2" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => addFilter("all")}>
              All Conversations
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addFilter("simple")}>
              Simple Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addFilter("agentic")}>
              Agentic Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addFilter("pinned")}>
              Pinned
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => addFilter("today")}>
              Today
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addFilter("week")}>
              This Week
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addFilter("month")}>
              This Month
            </DropdownMenuItem>

            {allTags.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                {allTags.slice(0, 5).map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    onClick={() => setSearchQuery(`tag:${tag}`)}
                  >
                    #{tag}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active Filters */}
        {activeFilters
          .filter((f) => f !== "all")
          .map((filter) => (
            <Badge
              key={filter}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => removeFilter(filter)}
            >
              {getFilterLabel(filter)}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          ))}
      </div>

      {/* Search Stats */}
      {hasActiveSearch && (
        <div className="text-xs text-muted-foreground">
          {searchQuery && `"${searchQuery}"`}
          {activeFilters.length > 0 &&
            activeFilters[0] !== "all" &&
            ` • ${activeFilters.map(getFilterLabel).join(", ")}`}
        </div>
      )}
    </div>
  );
};
