"use client"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"
import type { UserType } from "@/lib/types"

interface UserTypeSelectorProps {
  value: UserType | null
  onChange: (userType: UserType) => void
}

const userTypes: Array<{ value: UserType; label: string; description: string }> = [
  {
    value: "ceo",
    label: "CEO/Executive",
    description: "Set direction and view signals across all teams",
  },
  {
    value: "manager",
    label: "Team Leader/Manager",
    description: "Manage team signals and collaborate with leadership",
  },
  {
    value: "contributor",
    label: "Individual Contributor",
    description: "View and contribute to team signals",
  },
]

export function UserTypeSelector({ value, onChange }: UserTypeSelectorProps) {
  return (
    <div className="space-y-3">
      {userTypes.map((type) => (
        <Card
          key={type.value}
          className={`p-4 cursor-pointer transition-all hover:border-primary ${
            value === type.value ? "border-primary bg-primary/5" : "border-border"
          }`}
          onClick={() => onChange(type.value)}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                value === type.value ? "border-primary bg-primary" : "border-muted-foreground"
              }`}
            >
              {value === type.value && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{type.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{type.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
