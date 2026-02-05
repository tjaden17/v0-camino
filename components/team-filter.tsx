"use client"
import { Badge } from "@/components/ui/badge"
import type { UserGroup } from "@/lib/types"

interface TeamFilterProps {
  selectedTeam: UserGroup | "all"
  onTeamChange: (team: UserGroup | "all") => void
}

export function TeamFilter({ selectedTeam, onTeamChange }: TeamFilterProps) {
  const teams: Array<{ value: UserGroup | "all"; label: string; color: string }> = [
    { value: "all", label: "All Teams", color: "bg-primary" },
    { value: "product", label: "Product", color: "bg-blue-500" },
    { value: "sales", label: "Sales", color: "bg-green-500" },
    { value: "marketing", label: "Marketing", color: "bg-purple-500" },
    { value: "design", label: "Design", color: "bg-orange-500" },
  ]

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      {teams.map((team) => (
        <Badge
          key={team.value}
          variant={selectedTeam === team.value ? "default" : "outline"}
          className={`cursor-pointer px-3 py-1.5 text-xs whitespace-nowrap ${
            selectedTeam === team.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"
          }`}
          onClick={() => onTeamChange(team.value)}
        >
          {team.label}
        </Badge>
      ))}
    </div>
  )
}
