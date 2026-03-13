import { createClient } from "@/lib/supabase/server"
import type { UserContext } from "./user-context-service"

export interface SignalTemplate {
  id: string
  name: string
  description?: string
  category?: string
  roleLevel: string[]
  function: string[]
  businessStage: string[]
  industry: string[]
  signalName: string
  signalDescription?: string
  signalCategory?: string
  signalUnit?: string
  calculationLogic?: string
  industryBenchmark?: number
  bestInClassBenchmark?: number
  defaultPriority: number
  importanceScore: number
  usageCount: number
  isActive: boolean
}

export class SignalTemplatesService {
  /**
   * Get recommended templates based on user context
   */
  static async getRecommendedTemplates(userContext: UserContext): Promise<SignalTemplate[]> {
    const supabase = await createClient()

    // Build query based on user context
    const { data: templates, error } = await supabase
      .from("signal_templates")
      .select("*")
      .eq("is_active", true)
      .order("importance_score", { ascending: false })

    if (error || !templates) {
      console.error("[SignalTemplatesService] Error fetching templates:", error)
      return []
    }

    // Filter and score templates based on user context
    const scoredTemplates = templates
      .map((template) => {
        let relevanceScore = 0

        // Role level match (40% weight)
        if (template.role_level.includes(userContext.roleLevel)) {
          relevanceScore += 0.4
        }

        // Function match (30% weight)
        if (template.function.includes(userContext.function)) {
          relevanceScore += 0.3
        }

        // Business stage match (20% weight)
        if (template.business_stage.includes(userContext.businessStage)) {
          relevanceScore += 0.2
        }

        // Importance score (10% weight)
        relevanceScore += (template.importance_score / 10) * 0.1

        return {
          ...this.mapDatabaseToTemplate(template),
          relevanceScore,
        }
      })
      .filter((t) => t.relevanceScore > 0.3) // Only show templates with >30% relevance
      .sort((a, b) => b.relevanceScore - a.relevanceScore)

    return scoredTemplates.slice(0, 12) // Top 12 recommendations
  }

  /**
   * Get all available templates
   */
  static async getAllTemplates(): Promise<SignalTemplate[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("signal_templates")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("importance_score", { ascending: false })

    if (error || !data) {
      console.error("[SignalTemplatesService] Error fetching templates:", error)
      return []
    }

    return data.map(this.mapDatabaseToTemplate)
  }

  /**
   * Get templates by category
   */
  static async getTemplatesByCategory(category: string): Promise<SignalTemplate[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("signal_templates")
      .select("*")
      .eq("is_active", true)
      .eq("category", category)
      .order("importance_score", { ascending: false })

    if (error || !data) {
      return []
    }

    return data.map(this.mapDatabaseToTemplate)
  }

  /**
   * Create signal from template
   */
  static async createSignalFromTemplate(templateId: string, userId: string): Promise<string | null> {
    const supabase = await createClient()

    // Get template
    const { data: template, error: templateError } = await supabase
      .from("signal_templates")
      .select("*")
      .eq("id", templateId)
      .single()

    if (templateError || !template) {
      console.error("[SignalTemplatesService] Error fetching template:", templateError)
      return null
    }

    // Create signal from template
    const newSignal = {
      user_id: userId,
      name: template.signal_name,
      description: template.signal_description,
      category: template.signal_category,
      unit: template.signal_unit,
      benchmark_value: template.industry_benchmark || template.best_in_class_benchmark,
      benchmark_type: template.industry_benchmark ? "industry" : "user_defined",
      created_by: userId,
    }

    const { data: signal, error: signalError } = await supabase.from("signals").insert(newSignal).select().single()

    if (signalError || !signal) {
      console.error("[SignalTemplatesService] Error creating signal:", signalError)
      return null
    }

    // Increment usage count
    await supabase
      .from("signal_templates")
      .update({
        usage_count: (template.usage_count || 0) + 1,
      })
      .eq("id", templateId)

    return signal.id
  }

  /**
   * Bulk create signals from templates
   */
  static async bulkCreateSignalsFromTemplates(templateIds: string[], userId: string): Promise<string[]> {
    const signalIds: string[] = []

    for (const templateId of templateIds) {
      const signalId = await this.createSignalFromTemplate(templateId, userId)
      if (signalId) {
        signalIds.push(signalId)
      }
    }

    return signalIds
  }

  /**
   * Get template statistics
   */
  static async getTemplateStats(): Promise<{
    totalTemplates: number
    byCategory: Record<string, number>
    topUsed: SignalTemplate[]
  }> {
    const supabase = await createClient()

    const { data: templates } = await supabase.from("signal_templates").select("*").eq("is_active", true)

    if (!templates) {
      return {
        totalTemplates: 0,
        byCategory: {},
        topUsed: [],
      }
    }

    const byCategory = templates.reduce(
      (acc, t) => {
        const cat = t.category || "Other"
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const topUsed = templates
      .map(this.mapDatabaseToTemplate)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)

    return {
      totalTemplates: templates.length,
      byCategory,
      topUsed,
    }
  }

  private static mapDatabaseToTemplate(data: any): SignalTemplate {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      category: data.category,
      roleLevel: data.role_level || [],
      function: data.function || [],
      businessStage: data.business_stage || [],
      industry: data.industry || [],
      signalName: data.signal_name,
      signalDescription: data.signal_description,
      signalCategory: data.signal_category,
      signalUnit: data.signal_unit,
      calculationLogic: data.calculation_logic,
      industryBenchmark: data.industry_benchmark,
      bestInClassBenchmark: data.best_in_class_benchmark,
      defaultPriority: data.default_priority || 5,
      importanceScore: data.importance_score || 5,
      usageCount: data.usage_count || 0,
      isActive: data.is_active || false,
    }
  }
}
