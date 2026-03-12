import { createClient } from "@/lib/supabase/server"
import { UserContextService, type DataQualityScore } from "./user-context-service"

export interface DataState {
  state: "zero" | "low" | "rich"
  signalCount: number
  avgDataQuality: number
  recommendations: string[]
}

export interface EnrichedSignal {
  id: string
  name: string
  description?: string
  category?: string
  unit?: string
  currentValue?: number
  previousValue?: number
  changePercent?: number
  trend?: string
  status?: string
  benchmarkValue?: number
  dataQuality?: DataQualityScore
  dataState: "zero" | "low" | "rich"
  recommendations: string[]
}

export class ProgressiveDataService {
  /**
   * Determine the overall data state for a user
   */
  static async getUserDataState(userId: string): Promise<DataState> {
    const supabase = await createClient()

    // Get all signals for the user
    const { data: signals } = await supabase.from("signals").select("id").eq("user_id", userId)

    const signalCount = signals?.length || 0

    if (signalCount === 0) {
      return {
        state: "zero",
        signalCount: 0,
        avgDataQuality: 0,
        recommendations: [
          "Connect a data source to start tracking signals",
          "Upload a CSV file with your historical data",
          "Enable demo mode to explore with sample data",
        ],
      }
    }

    // Calculate average data quality
    let totalQuality = 0
    let qualityCount = 0

    for (const signal of signals || []) {
      const quality = await UserContextService.calculateDataQualityScore(signal.id)
      if (quality) {
        totalQuality += quality.overallQualityScore
        qualityCount++
      }
    }

    const avgDataQuality = qualityCount > 0 ? totalQuality / qualityCount : 0

    // Determine state
    let state: "zero" | "low" | "rich" = "low"
    const recommendations: string[] = []

    if (signalCount >= 5 && avgDataQuality >= 70) {
      state = "rich"
      recommendations.push("Great! Your data is comprehensive and high quality")
      recommendations.push("Consider adding cross-signal relationships for deeper insights")
    } else if (signalCount < 3) {
      state = "low"
      recommendations.push("Add more signals to get comprehensive insights")
      recommendations.push("Connect additional data sources")
    } else if (avgDataQuality < 50) {
      state = "low"
      recommendations.push("Improve data quality by adding more historical data points")
      recommendations.push("Set up automated data syncs to keep data fresh")
    } else {
      state = "low"
      recommendations.push("You're making progress! Keep adding data")
    }

    return {
      state,
      signalCount,
      avgDataQuality: Math.round(avgDataQuality),
      recommendations,
    }
  }

  /**
   * Get signals with enhanced data quality information
   */
  static async getEnrichedSignals(userId: string): Promise<EnrichedSignal[]> {
    const supabase = await createClient()

    const { data: signals } = await supabase
      .from("signals")
      .select(
        `
        *,
        profiles:owner_id (full_name)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (!signals || signals.length === 0) {
      return []
    }

    const enrichedSignals = await Promise.all(
      signals.map(async (signal) => {
        // Get data quality
        const quality = await UserContextService.calculateDataQualityScore(signal.id)

        // Determine data state
        let dataState: "zero" | "low" | "rich" = "low"
        const recommendations: string[] = []

        if (quality) {
          if (quality.overallQualityScore >= 75) {
            dataState = "rich"
          } else if (quality.overallQualityScore >= 40) {
            dataState = "low"
            if (quality.completenessScore < 60) {
              recommendations.push("Add more historical data points")
            }
            if (quality.freshnessScore < 60) {
              recommendations.push("Update data more frequently")
            }
            if (quality.consistencyScore < 60) {
              recommendations.push("Maintain consistent data collection intervals")
            }
          } else {
            dataState = "zero"
            recommendations.push("Add sufficient data to generate insights")
          }
        } else {
          dataState = "zero"
          recommendations.push("No data available - upload or connect a data source")
        }

        return {
          id: signal.id,
          name: signal.name,
          description: signal.description,
          category: signal.category,
          unit: signal.unit,
          currentValue: signal.current_value,
          previousValue: signal.previous_value,
          changePercent: signal.change_percent,
          trend: signal.trend,
          status: signal.status,
          benchmarkValue: signal.benchmark_value,
          dataQuality: quality || undefined,
          dataState,
          recommendations,
        }
      }),
    )

    return enrichedSignals
  }

  /**
   * Get recommended actions based on data state
   */
  static async getRecommendedActions(userId: string): Promise<{
    highPriority: string[]
    mediumPriority: string[]
    lowPriority: string[]
  }> {
    const dataState = await this.getUserDataState(userId)
    const userContext = await UserContextService.getUserContext(userId)

    const highPriority: string[] = []
    const mediumPriority: string[] = []
    const lowPriority: string[] = []

    if (dataState.state === "zero") {
      highPriority.push("Connect a data source (Zoho, HubSpot) to start tracking")
      highPriority.push("Upload historical data via CSV")
      mediumPriority.push("Enable demo mode to explore features")
    } else if (dataState.state === "low") {
      if (dataState.signalCount < 5) {
        highPriority.push("Add more signals to track your key metrics")
      }
      if (dataState.avgDataQuality < 50) {
        highPriority.push("Improve data quality by adding historical data")
        mediumPriority.push("Set up automated syncs for fresh data")
      }
      mediumPriority.push("Define your top 3 KPIs for personalized insights")
      lowPriority.push("Add benchmarks to compare performance")
    } else {
      // Rich data state
      mediumPriority.push("Explore AI-powered insights and predictions")
      mediumPriority.push("Set up cross-signal relationships")
      lowPriority.push("Create decisions and link relevant signals")
    }

    // Add context-specific recommendations
    if (userContext && !userContext.kpi1) {
      highPriority.push("Define your top 3 KPIs to get personalized signals")
    }

    return {
      highPriority,
      mediumPriority,
      lowPriority,
    }
  }
}
