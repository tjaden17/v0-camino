"use client"

import { Badge } from "@/components/ui/badge"
import type { UserGroup } from "@/lib/types"

interface GroupSelectorProps {
  selectedGroups: UserGroup[]
  onChange: (groups: UserGroup[]) => void
}

const groups: Array<{ value: UserGroup; label: string; color: string }> = [
  { value: "product", label: "Product", color: "bg-blue-500" },
  { value: "engineering", label: "Engineering", color: "bg-indigo-500" },
  { value: "design", label: "Design", color: "bg-purple-500" },
  { value: "sales", label: "Sales", color: "bg-green-500" },
  { value: "marketing", label: "Marketing", color: "bg-pink-500" },
  { value: "customer-success", label: "Customer Success", color: "bg-cyan-500" },
  { value: "finance", label: "Finance", color: "bg-emerald-500" },
  { value: "delivery", label: "Delivery", color: "bg-amber-500" },
]

export function GroupSelector({ selectedGroups, onChange }: GroupSelectorProps) {
  const toggleGroup = (group: UserGroup) => {
    if (selectedGroups.includes(group)) {
      onChange(selectedGroups.filter((g) => g !== group))
    } else {
      onChange([...selectedGroups, group])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {groups.map((group) => {
        const isSelected = selectedGroups.includes(group.value)
        return (
          <Badge
            key={group.value}
            variant={isSelected ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 text-sm ${
              isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            }`}
            onClick={() => toggleGroup(group.value)}
          >
            {group.label}
          </Badge>
        )
      })}
    </div>
  )
}
