import type { Team } from "./types"

export function getTeams(): Team[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("camino-teams")
  return stored ? JSON.parse(stored) : []
}

export function saveTeam(team: Team): void {
  if (typeof window === "undefined") return
  const teams = getTeams()
  teams.push(team)
  localStorage.setItem("camino-teams", JSON.stringify(teams))
}

export function updateTeam(teamId: string, updates: Partial<Team>): void {
  if (typeof window === "undefined") return
  const teams = getTeams()
  const index = teams.findIndex((t) => t.id === teamId)
  if (index !== -1) {
    teams[index] = { ...teams[index], ...updates }
    localStorage.setItem("camino-teams", JSON.stringify(teams))
  }
}

export function deleteTeam(teamId: string): void {
  if (typeof window === "undefined") return
  const teams = getTeams().filter((t) => t.id !== teamId)
  localStorage.setItem("camino-teams", JSON.stringify(teams))
}

export function addMemberToTeam(teamId: string, memberEmail: string): void {
  if (typeof window === "undefined") return
  const teams = getTeams()
  const team = teams.find((t) => t.id === teamId)
  if (team && !team.members.includes(memberEmail)) {
    team.members.push(memberEmail)
    localStorage.setItem("camino-teams", JSON.stringify(teams))
  }
}

export function removeMemberFromTeam(teamId: string, memberEmail: string): void {
  if (typeof window === "undefined") return
  const teams = getTeams()
  const team = teams.find((t) => t.id === teamId)
  if (team) {
    team.members = team.members.filter((m) => m !== memberEmail)
    localStorage.setItem("camino-teams", JSON.stringify(teams))
  }
}

export function getUserTeams(userEmail: string): Team[] {
  return getTeams().filter((t) => t.members.includes(userEmail))
}

export function isUserInTeam(teamId: string, userEmail: string): boolean {
  const team = getTeams().find((t) => t.id === teamId)
  return team ? team.members.includes(userEmail) : false
}
