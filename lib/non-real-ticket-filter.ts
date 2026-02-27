/**
 * Universal pattern detector for non-real (automated) tickets.
 * Used before signal calculation so ticket metrics exclude system noise.
 * See: docs/AI_PANEL_CONSULTATION_TICKET_FILTERING.md
 */

export interface TicketColumnMap {
  subjectCol: string | null
  createdCol: string | null
  closedCol: string | null
  threadsCol: string | null
  channelCol: string | null
}

/** Resolve ticket-related column names from CSV headers (any help desk tool). */
export function resolveTicketColumns(columns: string[]): TicketColumnMap {
  const lower = (s: string) => s.trim().toLowerCase()
  const col = (patterns: string[]): string | null => {
    for (const p of patterns) {
      const found = columns.find((c) => lower(c).includes(p) || lower(p).includes(lower(c)))
      if (found) return found
    }
    return null
  }
  return {
    subjectCol: col(["subject", "title", "summary"]),
    createdCol: col(["created time", "created date", "created_at", "created", "opened", "date created"]),
    closedCol: col(["closed time", "ticket closed", "closed date", "closed_at", "closed", "resolved", "resolution date"]),
    threadsCol: col(["number of threads", "threads", "thread count", "replies", "message count"]),
    channelCol: col(["channel", "source", "type"]),
  }
}

const AUTOMATED_SUBJECT_KEYWORDS = [
  "policy acknowledgment",
  "auto-reply",
  "out of office",
  "automatic reply",
  "survey reminder",
  "noreply",
  "no reply",
  "do not reply",
  "system notification",
  "password reset",
  "welcome email",
  "ticket created notification",
  "acknowledgment required",
]

const SYSTEM_CHANNEL_VALUES = ["system", "notification", "automated", "internal"]

export type FilterReason =
  | "automated_subject"
  | "bulk_creation"
  | "instant_close_zero_threads"
  | "channel_system"

/**
 * Returns true if the ticket matches any universal non-real pattern.
 * Optionally returns the reason for logging.
 */
export function isNonRealTicket(
  ticket: Record<string, string>,
  allTickets: Record<string, string>[],
  cols: TicketColumnMap
): { nonReal: boolean; reason?: FilterReason } {
  const subject = (cols.subjectCol ? ticket[cols.subjectCol] : "").toString().toLowerCase().trim()
  const createdStr = cols.createdCol ? ticket[cols.createdCol] : ""
  const closedStr = cols.closedCol ? ticket[cols.closedCol] : ""
  const createdTime = createdStr ? new Date(createdStr) : null
  const closedTime = closedStr ? new Date(closedStr) : null
  const threadsRaw = cols.threadsCol ? ticket[cols.threadsCol] : ""
  const threads = parseInt(String(threadsRaw).trim(), 10)
  const channel = (cols.channelCol ? ticket[cols.channelCol] : "").toString().toLowerCase().trim()

  // Pattern 1: Known automated subject keywords
  if (subject && AUTOMATED_SUBJECT_KEYWORDS.some((kw) => subject.includes(kw))) {
    return { nonReal: true, reason: "automated_subject" }
  }

  // Pattern 2: Bulk creation (>5 tickets within 60 seconds)
  if (createdTime && !isNaN(createdTime.getTime())) {
    const sameMinuteTickets = allTickets.filter((t) => {
      const tCreated = cols.createdCol ? new Date(t[cols.createdCol] || "") : null
      if (!tCreated || isNaN(tCreated.getTime())) return false
      return Math.abs(tCreated.getTime() - createdTime.getTime()) < 60_000
    })
    if (sameMinuteTickets.length > 5) {
      return { nonReal: true, reason: "bulk_creation" }
    }
  }

  // Pattern 3: Zero customer threads + instant close (<5 minutes)
  const resolutionSeconds =
    createdTime && closedTime && !isNaN(createdTime.getTime()) && !isNaN(closedTime.getTime())
      ? (closedTime.getTime() - createdTime.getTime()) / 1000
      : null
  const zeroThreads = isNaN(threads) ? true : threads === 0
  if (zeroThreads && resolutionSeconds !== null && resolutionSeconds < 300) {
    return { nonReal: true, reason: "instant_close_zero_threads" }
  }

  // Pattern 4: Channel = System / Notification (if column exists)
  if (cols.channelCol && channel && SYSTEM_CHANNEL_VALUES.some((v) => channel.includes(v))) {
    return { nonReal: true, reason: "channel_system" }
  }

  return { nonReal: false }
}

export interface FilterResult {
  filteredRows: Record<string, string>[]
  ticketsFiltered: number
  ticketsTotal: number
  filterReasons: { reason: FilterReason; count: number }[]
}

/**
 * Filter out non-real tickets from a list. Returns filtered rows and counts for metadata.
 */
export function filterNonRealTickets(
  rows: Record<string, string>[],
  columns: string[]
): FilterResult {
  const cols = resolveTicketColumns(columns)
  const reasonCounts: Record<FilterReason, number> = {
    automated_subject: 0,
    bulk_creation: 0,
    instant_close_zero_threads: 0,
    channel_system: 0,
  }

  const filteredRows = rows.filter((ticket) => {
    const { nonReal, reason } = isNonRealTicket(ticket, rows, cols)
    if (nonReal && reason) {
      reasonCounts[reason]++
      return false
    }
    return true
  })

  const filterReasons = (Object.entries(reasonCounts) as [FilterReason, number][])
    .filter(([, count]) => count > 0)
    .map(([reason, count]) => ({ reason, count }))

  return {
    filteredRows,
    ticketsFiltered: rows.length - filteredRows.length,
    ticketsTotal: rows.length,
    filterReasons,
  }
}
