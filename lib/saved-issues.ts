import type { SubIssue } from "./issue-tree-data"

interface SavedIssueWithTags {
  issue: SubIssue
  tags: string[]
}

const savedIssuesMap = new Map<string, SavedIssueWithTags>()

export function getSavedIssues(): SubIssue[] {
  return Array.from(savedIssuesMap.values()).map((item) => item.issue)
}

export function saveIssue(issue: SubIssue): void {
  if (!savedIssuesMap.has(issue.id)) {
    savedIssuesMap.set(issue.id, { issue, tags: [] })
  }
}

export function unsaveIssue(issueId: string): void {
  savedIssuesMap.delete(issueId)
}

export function isIssueSaved(issueId: string): boolean {
  return savedIssuesMap.has(issueId)
}

export function tagIssue(issueId: string, tag: string): void {
  const saved = savedIssuesMap.get(issueId)
  if (saved && !saved.tags.includes(tag)) {
    saved.tags.push(tag)
  }
}

export function untagIssue(issueId: string, tag: string): void {
  const saved = savedIssuesMap.get(issueId)
  if (saved) {
    saved.tags = saved.tags.filter((t) => t !== tag)
  }
}

export function getIssueTags(issueId: string): string[] {
  return savedIssuesMap.get(issueId)?.tags || []
}
