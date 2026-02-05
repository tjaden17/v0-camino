"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import type { UserPermission } from "@/lib/types"

interface TeamMember {
  id: string
  name: string
  email: string
  permissions: UserPermission[]
}

export function PermissionManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      permissions: ["view", "edit"],
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      permissions: ["view"],
    },
  ])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [invitePermission, setInvitePermission] = useState<UserPermission>("view")

  const handleInvite = () => {
    if (inviteEmail && inviteName) {
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        name: inviteName,
        email: inviteEmail,
        permissions: [invitePermission],
      }
      setTeamMembers([...teamMembers, newMember])
      setInviteEmail("")
      setInviteName("")
      setInvitePermission("view")
      setShowInviteForm(false)
    }
  }

  const handleRemoveMember = (memberId: string) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== memberId))
  }

  const handleUpdatePermission = (memberId: string, permission: UserPermission) => {
    setTeamMembers(teamMembers.map((m) => (m.id === memberId ? { ...m, permissions: [permission] } : m)))
  }

  return (
    <div className="space-y-4">
      {/* Team Members List */}
      <div className="space-y-3">
        {teamMembers.map((member) => (
          <Card key={member.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{member.name}</p>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={member.permissions[0]}
                  onValueChange={(value) => handleUpdatePermission(member.id, value as UserPermission)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="request">Request</SelectItem>
                    <SelectItem value="edit">Edit/Manage</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMember(member.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Invite Form */}
      {showInviteForm ? (
        <Card className="p-4 space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="Enter name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Permission Level</label>
            <Select value={invitePermission} onValueChange={(value) => setInvitePermission(value as UserPermission)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="request">Request</SelectItem>
                <SelectItem value="edit">Edit/Manage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInviteForm(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleInvite} className="flex-1">
              Send Invite
            </Button>
          </div>
        </Card>
      ) : (
        <Button onClick={() => setShowInviteForm(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
      )}

      {/* Permission Levels Info */}
      <div className="p-4 bg-muted/50 rounded-lg space-y-2">
        <p className="text-sm font-medium">Permission Levels:</p>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>
            <span className="font-medium">View Only:</span> Can view signals and dashboards
          </p>
          <p>
            <span className="font-medium">Request:</span> Can request new signals from team members
          </p>
          <p>
            <span className="font-medium">Edit/Manage:</span> Can add, edit, and manage signals
          </p>
        </div>
      </div>
    </div>
  )
}
