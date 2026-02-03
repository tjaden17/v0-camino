import type { SubIssue } from "./issue-tree-data"

// Value of Information (VOI) = (Value Unlocked if Information Used) × (Probability of Being Unlocked)
export interface VOICalculation {
  issueId: string
  valueUnlocked: number // Potential value in $ or impact score (0-100)
  probabilityOfAction: number // 0-1, likelihood user will act on this info
  voi: number // Final calculated value
  lastCalculated: Date
}

// Store VOI calculations
const voiStore = new Map<string, VOICalculation>()

/**
 * Calculate the value unlocked based on issue characteristics
 * This is a placeholder - you'll customize this based on your business logic
 */
function calculateValueUnlocked(issue: SubIssue): number {
  let value = 0

  // Trend magnitude contributes to value
  const trendMagnitude = Math.abs(Number.parseFloat(issue.trendValue.replace(/[^0-9.-]/g, ""))) || 0
  value += trendMagnitude * 10

  // Issues with more sub-issues are more strategic/valuable
  const subIssueCount = issue.subIssues?.length || 0
  value += subIssueCount * 5

  // Timeframe affects urgency/value
  if (issue.timeframe.includes("7 days") || issue.timeframe.includes("week")) {
    value *= 1.5 // More urgent = more valuable
  } else if (issue.timeframe.includes("30 days") || issue.timeframe.includes("month")) {
    value *= 1.2
  }

  // Negative trends (problems) are more valuable to address
  if (issue.trend === "down") {
    value *= 1.3
  }

  return Math.min(value, 100) // Cap at 100
}

/**
 * Calculate probability that user will act on this information
 * Based on relevance, urgency, and clarity
 */
function calculateProbabilityOfAction(issue: SubIssue): number {
  let probability = 0.5 // Base probability

  // Has detail = more actionable
  if (issue.detail) {
    probability += 0.2
  }

  // Has sub-issues = more concrete
  if (issue.subIssues && issue.subIssues.length > 0) {
    probability += 0.1
  }

  // Recent data = more relevant
  if (issue.timeframe.includes("7 days") || issue.timeframe.includes("week")) {
    probability += 0.15
  }

  // Negative trend = more likely to act
  if (issue.trend === "down") {
    probability += 0.1
  }

  // Has clear owner = more likely to be acted on
  if (issue.owner) {
    probability += 0.05
  }

  return Math.min(probability, 1.0) // Cap at 1.0
}

/**
 * Calculate VOI for an issue
 */
export function calculateVOI(issue: SubIssue): VOICalculation {
  const valueUnlocked = calculateValueUnlocked(issue)
  const probabilityOfAction = calculateProbabilityOfAction(issue)
  const voi = valueUnlocked * probabilityOfAction

  const calculation: VOICalculation = {
    issueId: issue.id,
    valueUnlocked,
    probabilityOfAction,
    voi,
    lastCalculated: new Date(),
  }

  voiStore.set(issue.id, calculation)
  return calculation
}

/**
 * Get VOI for an issue (calculate if not cached)
 */
export function getVOI(issue: SubIssue): VOICalculation {
  const cached = voiStore.get(issue.id)
  if (cached) {
    return cached
  }
  return calculateVOI(issue)
}

/**
 * Recalculate VOI for all issues in the tree
 */
export function recalculateAllVOI(issues: SubIssue[]): void {
  issues.forEach((issue) => {
    calculateVOI(issue)
    if (issue.subIssues) {
      recalculateAllVOI(issue.subIssues)
    }
  })
}

/**
 * Get top N issues by VOI
 */
export function getTopIssuesByVOI(issues: SubIssue[], n: number): SubIssue[] {
  const allIssues: SubIssue[] = []

  const collectIssues = (issueList: SubIssue[]) => {
    issueList.forEach((issue) => {
      allIssues.push(issue)
      if (issue.subIssues) {
        collectIssues(issue.subIssues)
      }
    })
  }

  collectIssues(issues)

  // Calculate VOI for all and sort
  return allIssues
    .map((issue) => ({
      issue,
      voi: getVOI(issue).voi,
    }))
    .sort((a, b) => b.voi - a.voi)
    .slice(0, n)
    .map((item) => item.issue)
}
