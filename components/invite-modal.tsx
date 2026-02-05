"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Mail, Users } from "lucide-react"
import { getUserProfile } from "@/lib/user-utils"
import { getTeams } from "@/lib/team-utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserProfile, Team } from "@/lib/types"

interface InviteModalProps {
  onClose: () => void
}

export function InviteModal({ onClose }: InviteModalProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [inviteType, setInviteType] = useState<"individual" | "organization">("individual")
  const [email, setEmail] = useState("")
  const [selectedTeam, setSelectedTeam] = useState("")
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const userProfile = getUserProfile()
    setProfile(userProfile)
    setTeams(getTeams())
  }, [])

  const handleSendInvite = () => {
    // In a real app, this would send an API request
    console.log("Sending invite:", {
      type: inviteType,
      email: inviteType === "individual" ? email : "all@organization",
      team: selectedTeam,
    })

    // Show success message (could use toast)
    alert(`Invite sent successfully!`)
    onClose()
  }

  const canInviteOrganization = profile?.userType === "ceo"

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-background border border-border rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Invite to Camino</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {/* Invite Type Selection */}
          <div className="space-y-2">
            <Label>Invite Type</Label>
            <div className="flex gap-2">
              <Button
                variant={inviteType === "individual" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setInviteType("individual")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Individual
              </Button>
              <Button
                variant={inviteType === "organization" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setInviteType("organization")}
                disabled={!canInviteOrganization}
                title={!canInviteOrganization ? "Admin rights required" : ""}
              >
                <Users className="h-4 w-4 mr-2" />
                Organization
              </Button>
            </div>
            {!canInviteOrganization && (
              <p className="text-xs text-muted-foreground">Organization invites require admin rights</p>
            )}
          </div>

          {/* Email Input (only for individual) */}
          {inviteType === "individual" && (
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          )}

          {/* Team Selection */}
          <div className="space-y-2">
            <Label htmlFor="team">Add to Team (Optional)</Label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger id="team">
                <SelectValue placeholder="Select a team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No team</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preview Message */}
          <div className="bg-muted p-3 rounded-md">
            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
            <p className="text-sm">
              {profile?.name} has invited you to join Camino
              {selectedTeam && selectedTeam !== "none"
                ? ` and the ${teams.find((t) => t.id === selectedTeam)?.name} team`
                : ""}
              . Click the link below to get started.
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSendInvite} disabled={inviteType === "individual" && !email.trim()}>
            Send Invite
          </Button>
        </div>
      </div>
    </div>
  )
}
