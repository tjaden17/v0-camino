// Specialized processor for Zoho Desk support tickets
// Generates high-level customer support KPIs from ticket data

import type { ParsedCSVRow, ColumnMapping } from "./csv-parser"

export interface SupportKPI {
  name: string
  value: number | string
  category: string
  trend: "increasing" | "decreasing" | "stable"
  benchmark?: number
}

export interface ZohoDeskTicket {
  ticketId?: string
  subject?: string
  status?: string
  priority?: string
  createdDate?: Date
  closedDate?: Date
  modifiedDate?: Date
  assignee?: string
  category?: string
  responseTime?: number // hours
  resolutionTime?: number // hours
}

export function parseZohoDeskTickets(rows: ParsedCSVRow[], mappings: ColumnMapping[]): ZohoDeskTicket[] {
  const tickets: ZohoDeskTicket[] = []

  // Find relevant column mappings
  const columnMap = new Map<string, string>()
  mappings.forEach((m) => {
    if (m.signalField !== "skip") {
      columnMap.set(m.signalField, m.csvColumn)
    }
  })

  for (const row of rows) {
    const ticket: ZohoDeskTicket = {}

    // Map standard fields
    if (columnMap.has("ticketId")) ticket.ticketId = String(row[columnMap.get("ticketId")!])
    if (columnMap.has("subject")) ticket.subject = String(row[columnMap.get("subject")!])
    if (columnMap.has("status")) ticket.status = String(row[columnMap.get("status")!])
    if (columnMap.has("priority")) ticket.priority = String(row[columnMap.get("priority")!])
    if (columnMap.has("assignee")) ticket.assignee = String(row[columnMap.get("assignee")!])
    if (columnMap.has("category")) ticket.category = String(row[columnMap.get("category")!])

    // Parse dates
    if (columnMap.has("createdDate")) {
      const dateStr = row[columnMap.get("createdDate")!]
      ticket.createdDate = dateStr ? new Date(String(dateStr)) : undefined
    }
    if (columnMap.has("closedDate")) {
      const dateStr = row[columnMap.get("closedDate")!]
      ticket.closedDate = dateStr ? new Date(String(dateStr)) : undefined
    }
    if (columnMap.has("modifiedDate")) {
      const dateStr = row[columnMap.get("modifiedDate")!]
      ticket.modifiedDate = dateStr ? new Date(String(dateStr)) : undefined
    }

    // Calculate resolution time if both dates exist
    if (ticket.createdDate && ticket.closedDate) {
      const diff = ticket.closedDate.getTime() - ticket.createdDate.getTime()
      ticket.resolutionTime = diff / (1000 * 60 * 60) // Convert to hours
    }

    tickets.push(ticket)
  }

  return tickets
}

export function generateSupportKPIs(tickets: ZohoDeskTicket[]): SupportKPI[] {
  const kpis: SupportKPI[] = []

  // KPI 1: Total Ticket Volume
  kpis.push({
    name: "Total Support Tickets",
    value: tickets.length,
    category: "Volume",
    trend: "stable",
  })

  // KPI 2: Open Tickets
  const openTickets = tickets.filter((t) => t.status && !["closed", "resolved"].includes(t.status.toLowerCase()))
  kpis.push({
    name: "Open Tickets",
    value: openTickets.length,
    category: "Volume",
    trend: openTickets.length > tickets.length * 0.3 ? "increasing" : "stable",
  })

  // KPI 3: Closed Tickets
  const closedTickets = tickets.filter((t) => t.status && ["closed", "resolved"].includes(t.status.toLowerCase()))
  kpis.push({
    name: "Closed Tickets",
    value: closedTickets.length,
    category: "Volume",
    trend: "stable",
  })

  // KPI 4: Average Resolution Time (hours)
  const ticketsWithResolutionTime = tickets.filter((t) => t.resolutionTime)
  if (ticketsWithResolutionTime.length > 0) {
    const avgResolutionTime =
      ticketsWithResolutionTime.reduce((sum, t) => sum + (t.resolutionTime || 0), 0) / ticketsWithResolutionTime.length

    kpis.push({
      name: "Avg Resolution Time",
      value: `${avgResolutionTime.toFixed(1)} hours`,
      category: "Performance",
      trend: avgResolutionTime > 48 ? "increasing" : avgResolutionTime < 24 ? "decreasing" : "stable",
      benchmark: 24, // 24 hours target
    })
  }

  // KPI 5: First Response Time (estimated from modified date)
  const ticketsWithResponse = tickets.filter((t) => t.createdDate && t.modifiedDate)
  if (ticketsWithResponse.length > 0) {
    const responsesTimes = ticketsWithResponse.map((t) => {
      const diff = t.modifiedDate!.getTime() - t.createdDate!.getTime()
      return diff / (1000 * 60 * 60) // hours
    })

    const avgResponseTime = responsesTimes.reduce((sum, t) => sum + t, 0) / responsesTimes.length

    kpis.push({
      name: "Avg First Response Time",
      value: `${avgResponseTime.toFixed(1)} hours`,
      category: "Performance",
      trend: avgResponseTime > 4 ? "increasing" : avgResponseTime < 2 ? "decreasing" : "stable",
      benchmark: 2, // 2 hours target
    })
  }

  // KPI 6: Resolution Rate
  const resolutionRate = tickets.length > 0 ? (closedTickets.length / tickets.length) * 100 : 0
  kpis.push({
    name: "Resolution Rate",
    value: `${resolutionRate.toFixed(1)}%`,
    category: "Performance",
    trend: resolutionRate > 80 ? "stable" : "decreasing",
    benchmark: 90, // 90% target
  })

  // KPI 7: High Priority Tickets
  const highPriorityTickets = tickets.filter((t) => t.priority && ["high", "urgent"].includes(t.priority.toLowerCase()))
  kpis.push({
    name: "High Priority Tickets",
    value: highPriorityTickets.length,
    category: "Priority",
    trend: highPriorityTickets.length > tickets.length * 0.2 ? "increasing" : "stable",
  })

  // KPI 8: Tickets by Status (summary)
  const statusCounts = new Map<string, number>()
  tickets.forEach((t) => {
    if (t.status) {
      const status = t.status
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
    }
  })

  // KPI 9: Tickets Pending (if status exists)
  const pendingTickets = tickets.filter((t) => t.status && t.status.toLowerCase().includes("pending"))
  if (pendingTickets.length > 0) {
    kpis.push({
      name: "Pending Tickets",
      value: pendingTickets.length,
      category: "Volume",
      trend: "stable",
    })
  }

  // KPI 10: Backlog (Open tickets older than 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const backlogTickets = openTickets.filter((t) => t.createdDate && t.createdDate < sevenDaysAgo)
  kpis.push({
    name: "Backlog (7+ days old)",
    value: backlogTickets.length,
    category: "Volume",
    trend: backlogTickets.length > openTickets.length * 0.5 ? "increasing" : "stable",
  })

  return kpis
}

export function autoSuggestZohoDeskMapping(headers: string[]): ColumnMapping[] {
  const mappings: ColumnMapping[] = []

  for (const header of headers) {
    const lower = header.toLowerCase()
    let suggested: ColumnMapping["signalField"] = "skip"

    // Zoho Desk specific column detection
    if (
      lower.includes("ticket id") ||
      lower.includes("ticket number") ||
      lower.includes("id") ||
      lower.includes("number")
    ) {
      suggested = "ticketId" as any
    } else if (lower.includes("subject") || lower.includes("title") || lower.includes("summary")) {
      suggested = "subject" as any
    } else if (lower.includes("status")) {
      suggested = "status" as any
    } else if (lower.includes("priority")) {
      suggested = "priority" as any
    } else if (lower.includes("created") || (lower.includes("date") && lower.includes("created"))) {
      suggested = "createdDate" as any
    } else if (lower.includes("closed") || (lower.includes("date") && lower.includes("closed"))) {
      suggested = "closedDate" as any
    } else if (
      lower.includes("modified") ||
      lower.includes("updated") ||
      (lower.includes("date") && lower.includes("modified"))
    ) {
      suggested = "modifiedDate" as any
    } else if (lower.includes("assignee") || lower.includes("assigned") || lower.includes("owner")) {
      suggested = "assignee" as any
    } else if (lower.includes("category") || lower.includes("department") || lower.includes("type")) {
      suggested = "category" as any
    }

    mappings.push({ csvColumn: header, signalField: suggested })
  }

  return mappings
}
