// Automatic signal generation from data patterns

import type { UniversalDataPoint } from "./universal-schema"
import { aggregateToSignals } from "./universal-schema"
import { createAdminClient } from "./supabase/admin"

export interface GeneratedSignal {
  name: string
  category: string
  value: number
  benchmark?: number
  trend: "increasing" | "decreasing" | "stable"
  insight?: string
  priority: "high" | "medium" | "low"
  dataPoints: UniversalDataPoint[]
  kpiTags?: string[] // Tags like "Revenue Growth", "Customer Satisfaction", "Team Productivity"
  relatedKPIs?: string[] // User's main KPI names this signal relates to
}

export class SignalGenerator {
  private matchSignalToUserKPIs(signalName: string, signalCategory: string, userKPIs: string[]): string[] {
    if (!userKPIs || userKPIs.length === 0) {
      return []
    }

    const matches: string[] = []
    const lowerSignalName = signalName.toLowerCase()
    const lowerCategory = signalCategory.toLowerCase()

    for (const kpi of userKPIs) {
      const lowerKPI = kpi.toLowerCase()

      // Check if signal name contains KPI keywords
      if (lowerSignalName.includes(lowerKPI) || lowerKPI.includes(lowerSignalName)) {
        matches.push(kpi)
      }

      // Check category-based matching
      else if (this.isCategoryRelated(lowerCategory, lowerKPI)) {
        matches.push(kpi)
      }

      // Check common KPI patterns
      else if (this.isKPIPatternMatch(lowerSignalName, lowerKPI)) {
        matches.push(kpi)
      }
    }

    return matches
  }

  private isCategoryRelated(category: string, kpi: string): boolean {
    const categoryMappings: Record<string, string[]> = {
      sales: ["revenue", "growth", "pipeline", "deals", "conversion"],
      support: ["satisfaction", "csat", "nps", "tickets", "resolution"],
      operations: ["efficiency", "productivity", "utilization", "capacity"],
      finance: ["profit", "margin", "revenue", "cost", "burn"],
      marketing: ["leads", "acquisition", "engagement", "conversion"],
      product: ["adoption", "engagement", "retention", "churn"],
    }

    const keywords = categoryMappings[category] || []
    return keywords.some((keyword) => kpi.includes(keyword))
  }

  private isKPIPatternMatch(signalName: string, kpi: string): boolean {
    // Common KPI patterns
    const patterns = [
      { signal: "revenue", kpis: ["revenue", "growth", "sales"] },
      { signal: "customer", kpis: ["satisfaction", "retention", "churn"] },
      { signal: "deal", kpis: ["pipeline", "revenue", "sales"] },
      { signal: "ticket", kpis: ["support", "satisfaction", "resolution"] },
      { signal: "conversion", kpis: ["sales", "marketing", "growth"] },
      { signal: "churn", kpis: ["retention", "customer", "growth"] },
    ]

    for (const pattern of patterns) {
      if (signalName.includes(pattern.signal)) {
        return pattern.kpis.some((k) => kpi.includes(k))
      }
    }

    return false
  }

  private async getUserMainKPIs(userId: string, orgId: string): Promise<string[]> {
    const supabase = createAdminClient()

    // Get user's profile KPIs (kpi_1, kpi_2, kpi_3)
    const { data: profile } = await supabase
      .from("profiles")
      .select("kpi_1, kpi_2, kpi_3")
      .eq("id", userId)
      .maybeSingle()

    if (!profile) {
      console.log("[v0] No profile found for user:", userId)
      return []
    }

    const kpis: string[] = []
    if (profile?.kpi_1) kpis.push(profile.kpi_1)
    if (profile?.kpi_2) kpis.push(profile.kpi_2)
    if (profile?.kpi_3) kpis.push(profile.kpi_3)

    const filteredKPIs = kpis.filter(Boolean)

    if (filteredKPIs.length === 0) {
      console.log("[v0] User has no KPIs set, signals will not be filtered by KPI")
    }

    return filteredKPIs
  }

  private async saveSignalToDatabase(signal: GeneratedSignal, userId: string, orgId: string) {
    const supabase = createAdminClient()

    const { data: existingSignal } = await supabase
      .from("signals")
      .select("id")
      .eq("name", signal.name)
      .eq("organization_id", orgId)
      .maybeSingle()

    let signalId: string

    if (existingSignal) {
      // Update existing signal
      const { data } = await supabase
        .from("signals")
        .update({
          category: signal.category,
          benchmark_value: signal.benchmark,
          trend: signal.trend,
          priority: signal.priority,
          metadata: {
            kpiTags: signal.kpiTags,
            relatedKPIs: signal.relatedKPIs,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingSignal.id)
        .select("id")
        .maybeSingle()

      signalId = data!.id
    } else {
      // Create new signal
      const { data } = await supabase
        .from("signals")
        .insert({
          name: signal.name,
          category: signal.category,
          benchmark_value: signal.benchmark,
          trend: signal.trend,
          priority: signal.priority,
          organization_id: orgId,
          created_by: userId,
          metadata: {
            kpiTags: signal.kpiTags,
            relatedKPIs: signal.relatedKPIs,
          },
        })
        .select("id")
        .maybeSingle()

      signalId = data!.id
    }

    if (signal.relatedKPIs && signal.relatedKPIs.length > 0) {
      await this.autoAssignSignalToUsers(signalId, signal.relatedKPIs, orgId)
    }

    // Save all data points
    for (const dataPoint of signal.dataPoints) {
      await supabase.from("data_points").upsert(
        {
          signal_id: signalId,
          value: dataPoint.value,
          date: dataPoint.date.toISOString().split("T")[0],
          metadata: dataPoint.metadata,
          created_by: userId,
        },
        {
          onConflict: "signal_id,date",
        },
      )
    }

    return signalId
  }

  private async autoAssignSignalToUsers(signalId: string, relatedKPIs: string[], orgId: string) {
    if (!relatedKPIs || relatedKPIs.length === 0) {
      console.log("[v0] No related KPIs for signal, skipping auto-assignment")
      return
    }

    const supabase = createAdminClient()

    // Find users in this org whose main KPIs match this signal
    const { data: orgMembers } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", orgId)

    if (!orgMembers) return

    for (const member of orgMembers) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("kpi_1, kpi_2, kpi_3")
        .eq("id", member.user_id)
        .maybeSingle()

      if (!profile) continue

      const userKPIs = [profile.kpi_1, profile.kpi_2, profile.kpi_3].filter(Boolean)

      if (userKPIs.length === 0) {
        console.log("[v0] User", member.user_id, "has no KPIs set, skipping auto-assignment")
        continue
      }

      const hasMatch = userKPIs.some((kpi) =>
        relatedKPIs.some(
          (related) =>
            kpi.toLowerCase().includes(related.toLowerCase()) || related.toLowerCase().includes(kpi.toLowerCase()),
        ),
      )

      if (hasMatch) {
        // Auto-assign this signal to the user as a KPI
        await supabase.from("kpi_ownership").upsert(
          {
            user_id: member.user_id,
            signal_id: signalId,
            is_primary: true,
          },
          {
            onConflict: "user_id,signal_id",
          },
        )
      }
    }
  }

  async generateSignalsFromData(
    dataPoints: UniversalDataPoint[],
    userId: string,
    orgId: string,
  ): Promise<GeneratedSignal[]> {
    const signals: GeneratedSignal[] = []

    const userMainKPIs = await this.getUserMainKPIs(userId, orgId)

    if (userMainKPIs.length === 0) {
      console.log("[v0] Generating signals without KPI filtering (user has no KPIs set)")
    }

    // Aggregate data points into signals
    const aggregated = aggregateToSignals(dataPoints)

    for (const [name, latest] of aggregated.entries()) {
      const relatedPoints = dataPoints.filter((p) => p.name === name)

      // Generate insight based on trend and benchmark
      const insight = this.generateInsight(latest, relatedPoints)

      // Calculate priority
      const priority = this.calculatePriority(latest)

      const relatedKPIs = this.matchSignalToUserKPIs(latest.name, latest.category, userMainKPIs)
      const kpiTags = this.generateKPITags(latest.category, latest.name)

      const signal: GeneratedSignal = {
        name: latest.name,
        category: latest.category,
        value: latest.value,
        benchmark: latest.benchmark,
        trend: latest.trend || "stable",
        insight,
        priority,
        dataPoints: relatedPoints,
        kpiTags,
        relatedKPIs,
      }

      // Save to database
      await this.saveSignalToDatabase(signal, userId, orgId)

      signals.push(signal)
    }

    return signals
  }

  private generateKPITags(category: string, name: string): string[] {
    const tags: string[] = []
    const lowerName = name.toLowerCase()

    // Add category-based tags
    tags.push(category.charAt(0).toUpperCase() + category.slice(1))

    // Add context-based tags
    if (lowerName.includes("revenue") || lowerName.includes("deal")) tags.push("Revenue Growth")
    if (lowerName.includes("customer") || lowerName.includes("satisfaction")) tags.push("Customer Satisfaction")
    if (lowerName.includes("efficiency") || lowerName.includes("productivity")) tags.push("Team Productivity")
    if (lowerName.includes("cost") || lowerName.includes("margin")) tags.push("Profitability")
    if (lowerName.includes("retention") || lowerName.includes("churn")) tags.push("Customer Retention")
    if (lowerName.includes("lead") || lowerName.includes("acquisition")) tags.push("Lead Generation")

    return [...new Set(tags)] // Remove duplicates
  }

  private generateInsight(latest: UniversalDataPoint, historicalData: UniversalDataPoint[]): string {
    if (!latest.benchmark) {
      if (latest.trend === "increasing") {
        return `${latest.name} is trending up. Current value: ${latest.value}${latest.unit || ""}`
      } else if (latest.trend === "decreasing") {
        return `${latest.name} is trending down. Current value: ${latest.value}${latest.unit || ""}`
      } else {
        return `${latest.name} is stable at ${latest.value}${latest.unit || ""}`
      }
    }

    // Compare to benchmark
    const percentOfBenchmark = (latest.value / latest.benchmark) * 100

    if (percentOfBenchmark >= 100) {
      return `✅ ${latest.name} exceeded target! ${latest.value}${latest.unit || ""} vs ${latest.benchmark}${latest.unit || ""} target (${percentOfBenchmark.toFixed(0)}%)`
    } else if (percentOfBenchmark >= 90) {
      return `⚠️ ${latest.name} is close to target: ${latest.value}${latest.unit || ""} vs ${latest.benchmark}${latest.unit || ""} target (${percentOfBenchmark.toFixed(0)}%)`
    } else {
      return `🔴 ${latest.name} is below target: ${latest.value}${latest.unit || ""} vs ${latest.benchmark}${latest.unit || ""} target (${percentOfBenchmark.toFixed(0)}%)`
    }
  }

  private calculatePriority(dataPoint: UniversalDataPoint): "high" | "medium" | "low" {
    if (!dataPoint.benchmark) return "medium"

    const percentOfBenchmark = (dataPoint.value / dataPoint.benchmark) * 100

    if (percentOfBenchmark < 70) return "high" // Significantly below target
    if (percentOfBenchmark < 90) return "medium" // Below target
    return "low" // Meeting or exceeding target
  }
}
