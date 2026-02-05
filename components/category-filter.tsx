"use client"

import { Button } from "@/components/ui/button"
import type { InsightCategory } from "@/lib/types"

interface CategoryFilterProps {
  selectedCategories: Set<InsightCategory>
  onCategoryToggle: (category: InsightCategory) => void
}

const categories = [
  { id: "product" as const, label: "Product", icon: "🚀" },
  { id: "market" as const, label: "Market", icon: "📈" },
  { id: "business" as const, label: "Business", icon: "💼" },
  { id: "tech" as const, label: "Tech", icon: "⚡" },
]

export function CategoryFilter({ selectedCategories, onCategoryToggle }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategories.has(category.id) ? "default" : "outline"}
          size="sm"
          onClick={() => onCategoryToggle(category.id)}
          className="flex items-center gap-2 whitespace-nowrap text-sm px-4 py-2"
        >
          <span className="text-sm">{category.icon}</span>
          <span>{category.label}</span>
        </Button>
      ))}
    </div>
  )
}
