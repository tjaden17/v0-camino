"use client"

import { userProfile, type UserProfile } from "./user-data"
import { getDemoProfileById, type DemoProfile } from "./demo-profiles"

const DEMO_MODE_KEY = "camino_demo_mode"
const DEMO_PROFILE_ID_KEY = "camino_demo_profile_id"

export function isDemoModeActive(): boolean {
  if (typeof window === "undefined") return false
  return localStorage.getItem(DEMO_MODE_KEY) === "true"
}

export function getActiveDemoProfileId(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(DEMO_PROFILE_ID_KEY)
}

export function enableDemoMode(profileId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(DEMO_MODE_KEY, "true")
  localStorage.setItem(DEMO_PROFILE_ID_KEY, profileId)
}

export function exitDemoMode(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(DEMO_MODE_KEY)
  localStorage.removeItem(DEMO_PROFILE_ID_KEY)
}

export function getActiveProfile(): UserProfile {
  if (!isDemoModeActive()) {
    return userProfile
  }

  const demoProfileId = getActiveDemoProfileId()
  if (!demoProfileId) {
    return userProfile
  }

  const demoProfile = getDemoProfileById(demoProfileId)
  if (!demoProfile) {
    return userProfile
  }

  // Convert DemoProfile to UserProfile format
  return convertDemoToUserProfile(demoProfile)
}

function convertDemoToUserProfile(demoProfile: DemoProfile): UserProfile {
  return {
    name: demoProfile.name,
    role: demoProfile.role,
    businessUnit: demoProfile.businessUnit,
    company: demoProfile.company,
    importantToMe: demoProfile.importantToMe.map((m) => m.metric),
    importantToTeam: demoProfile.importantToTeam.map((m) => m.metric),
    importantToCompany: demoProfile.importantToCompany.map((m) => m.metric),
    productCategory: demoProfile.productCategory,
    productStage: demoProfile.productStage,
    businessStage: demoProfile.businessStage,
    defaultView: demoProfile.defaultView,
    savedIssueIds: demoProfile.savedIssueIds,
    companyMission: demoProfile.companyMission,
    roleMission: demoProfile.roleMission,
    upcomingDecisions: demoProfile.upcomingDecisions,
  }
}
