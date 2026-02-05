import type { UserProfile, UserType, UserGroup, UserPermission } from "./types"

export function getUserProfile(): UserProfile | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem("camino-user-profile")
  return stored ? JSON.parse(stored) : null
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return
  localStorage.setItem("camino-user-profile", JSON.stringify(profile))
}

export function updateUserProfile(updates: Partial<UserProfile>): void {
  const current = getUserProfile()
  if (current) {
    saveUserProfile({ ...current, ...updates })
  }
}

export function getUserTypeLabel(userType: UserType): string {
  const labels: Record<UserType, string> = {
    ceo: "CEO/Executive",
    manager: "Team Leader/Manager",
    contributor: "Individual Contributor",
  }
  return labels[userType]
}

export function getGroupLabel(group: UserGroup): string {
  const labels: Record<UserGroup, string> = {
    product: "Product",
    engineering: "Engineering",
    design: "Design",
    sales: "Sales",
    marketing: "Marketing",
    "customer-success": "Customer Success",
    finance: "Finance",
    delivery: "Delivery",
  }
  return labels[group]
}

export function getPermissionLabel(permission: UserPermission): string {
  const labels: Record<UserPermission, string> = {
    view: "View Only",
    edit: "Edit/Manage",
    request: "Request",
  }
  return labels[permission]
}

export function hasPermission(permission: UserPermission, requiredPermission: UserPermission): boolean {
  const hierarchy: Record<UserPermission, number> = {
    view: 1,
    request: 2,
    edit: 3,
  }
  return hierarchy[permission] >= hierarchy[requiredPermission]
}

export function canEditSignals(profile: UserProfile | null): boolean {
  if (!profile) return false
  return profile.permissions.some((p) => hasPermission(p, "edit"))
}

export function canRequestSignals(profile: UserProfile | null): boolean {
  if (!profile) return false
  return profile.permissions.some((p) => hasPermission(p, "request"))
}
