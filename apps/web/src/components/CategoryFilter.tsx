"use client";

import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: { id: string; name: string }[];
  active: string;
  onChange: (id: string) => void;
}

export default function CategoryFilter({ categories, active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onChange(category.id)}
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            active === category.id
              ? "border-forest bg-forest text-linen"
              : "border-fern text-fern hover:bg-mist"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
