"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Users, Trash2, LogOut, UserPlus } from "lucide-react"
import { getUserProfile } from "@/lib/user-utils"
import { getTeams, saveTeam, getUserTeams, addMemberToTeam, removeMemberFromTeam, deleteTeam } from "@/lib/team-utils"
import { InviteModal } from "@/components/invite-modal"
import type { Team, UserProfile } from "@/lib/types"

export function TeamManagement() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [myTeams, setMyTeams] = useState<Team[]>([])
  const [showCreateTeam, setShowCreateTeam] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [showInviteModal, setShowInviteModal] = useState(false)

  useEffect(() => {
    const userProfile = getUserProfile()
    setProfile(userProfile)
    loadTeams(userProfile)
  }, [])

  const loadTeams = (userProfile: UserProfile | null) => {
    if (!userProfile) return
    const teams = getTeams()
    setAllTeams(teams)
    setMyTeams(getUserTeams(userProfile.email))
  }

  const handleCreateTeam = () => {
    if (!profile || !newTeamName.trim()) return

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: newTeamName.trim(),
      members: [profile.email],
      createdBy: profile.email,
      createdAt: new Date().toISOString(),
    }

    saveTeam(newTeam)
    setNewTeamName("")
    setShowCreateTeam(false)
    loadTeams(profile)
  }

  const handleJoinTeam = (teamId: string) => {
    if (!profile) return
    addMemberToTeam(teamId, profile.email)
    loadTeams(profile)
  }

  const handleLeaveTeam = (teamId: string) => {
    if (!profile) return
    removeMemberFromTeam(teamId, profile.email)
    loadTeams(profile)
  }

  const handleDeleteTeam = (teamId: string) => {
    if (!profile) return
    deleteTeam(teamId)
    loadTeams(profile)
  }

  const isInTeam = (teamId: string) => {
    return myTeams.some((t) => t.id === teamId)
  }

  const isTeamCreator = (team: Team) => {
    return profile?.email === team.createdBy
  }

  return (
    <div className="space-y-4">
      {/* My Teams */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-foreground">My Teams</h3>
          <Button variant="outline" size="sm" onClick={() => setShowCreateTeam(!showCreateTeam)}>
            <Plus className="h-4 w-4 mr-1" />
            Create Team
          </Button>
        </div>

        {showCreateTeam && (
          <Card className="mb-3">
            <CardContent className="pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Team name (e.g., Marketing)"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateTeam()}
                />
                <Button onClick={handleCreateTeam} size="sm">
                  Create
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateTeam(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-2">
          {myTeams.length === 0 ? (
            <p className="text-sm text-muted-foreground">You're not in any teams yet</p>
          ) : (
            myTeams.map((team) => (
              <Card key={team.id}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">{team.name}</span>
                        {isTeamCreator(team) && (
                          <Badge variant="secondary" className="text-xs">
                            Creator
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{team.members.length} members</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleLeaveTeam(team.id)} title="Leave team">
                        <LogOut className="h-4 w-4" />
                      </Button>
                      {isTeamCreator(team) && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteTeam(team.id)} title="Delete team">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Browse All Teams */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Browse All Teams</h3>
        <div className="space-y-2">
          {allTeams.filter((t) => !isInTeam(t.id)).length === 0 ? (
            <p className="text-sm text-muted-foreground">No other teams available</p>
          ) : (
            allTeams
              .filter((t) => !isInTeam(t.id))
              .map((team) => (
                <Card key={team.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{team.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{team.members.length} members</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleJoinTeam(team.id)}>
                        <Plus className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </div>

      {/* Invite to Camino */}
      <div className="pt-2">
        <Button onClick={() => setShowInviteModal(true)} className="w-full" variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Invite to Camino
        </Button>
      </div>

      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  )
}
