import { createClient } from "@/lib/supabase/server"

/**
 * User Context - Read from user_context table + profiles
 * Used by Signal Intelligence Service to rank and prioritize signals
 */
export interface UserContext {
  userId: string
  organizationId?: string
  
  // Role & Position
  role?: string  // CEO, VP Sales, CFO, Head of Support, etc.
  department?: string  // Sales, Marketing, Finance, Product, Support, etc.
  seniorityLevel?: string  // Executive, Director, Manager, IC
  
  // Business Context
  businessStage?: string  // Pre-PMF, Post-PMF, Scaling, Enterprise
  companySize?: string  // 1-10, 11-50, 51-200, 201-500, 500+
  industry?: string
  
  // User's Priority Areas (what they care about most)
  priorityAreas: string[]  // ["revenue_growth", "customer_retention", "operational_efficiency"]
  
  // User's Goals (specific KPIs they're tracking)
  goals: UserGoal[]
  
  // Signal Preferences
  preferredCategories: string[]  // ["Revenue", "Sales", "Support"]
  pinnedSignals: string[]  // Signal IDs user has pinned
  hiddenSignals: string[]  // Signal IDs user has hidden
  
  // From profile (legacy KPIs)
  kpi1?: string
  kpi2?: string
  kpi3?: string
}

export interface UserGoal {
  id: string
  title: string
  description?: string
  signalId?: string
  signalName?: string
  targetValue?: number
  targetDirection?: 'increase' | 'decrease' | 'maintain'
  targetDate?: string
  priority: number
  status: 'active' | 'achieved' | 'missed' | 'paused'
}

export interface RoleSignalRelevance {
  role: string
  signalCategory: string
  relevanceScore: number  // 1-10
  isCoreMetric: boolean
}

export class UserContextService {
  /**
   * Get complete user context for signal ranking
   */
  static async getUserContext(userId: string): Promise<UserContext | null> {
    const supabase = await createClient()
    
    // Fetch user_context and profile in parallel
    const [contextResult, profileResult, goalsResult] = await Promise.all([
      supabase
        .from('user_context')
        .select('*')
        .eq('user_id', userId)
        .single(),
      supabase
        .from('profiles')
        .select('role, kpi_1, kpi_2, kpi_3, company_stage, organization_id')
        .eq('id', userId)
        .single(),
      supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('priority', { ascending: true })
    ])
    
    const context = contextResult.data
    const profile = profileResult.data
    const goals = goalsResult.data || []
    
    // Build unified context
    return {
      userId,
      organizationId: profile?.organization_id || context?.organization_id,
      
      // Role & Position (prefer context, fallback to profile)
      role: context?.role || profile?.role,
      department: context?.department,
      seniorityLevel: context?.seniority_level || this.inferSeniority(context?.role || profile?.role),
      
      // Business Context
      businessStage: context?.business_stage || profile?.company_stage,
      companySize: context?.company_size,
      industry: context?.industry,
      
      // Priorities
      priorityAreas: context?.priority_areas || [],
      
      // Goals
      goals: goals.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        signalId: g.signal_id,
        signalName: g.signal_name,
        targetValue: g.target_value,
        targetDirection: g.target_direction,
        targetDate: g.target_date,
        priority: g.priority,
        status: g.status
      })),
      
      // Signal Preferences
      preferredCategories: context?.preferred_signal_categories || [],
      pinnedSignals: context?.pinned_signals || [],
      hiddenSignals: context?.hidden_signals || [],
      
      // Legacy KPIs from profile
      kpi1: profile?.kpi_1,
      kpi2: profile?.kpi_2,
      kpi3: profile?.kpi_3,
    }
  }
  
  /**
   * Update user context
   */
  static async updateUserContext(
    userId: string,
    updates: Partial<{
      role: string
      department: string
      seniorityLevel: string
      businessStage: string
      companySize: string
      industry: string
      priorityAreas: string[]
      preferredCategories: string[]
      pinnedSignals: string[]
      hiddenSignals: string[]
    }>
  ): Promise<boolean> {
    const supabase = await createClient()
    
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }
    
    if (updates.role !== undefined) dbUpdates.role = updates.role
    if (updates.department !== undefined) dbUpdates.department = updates.department
    if (updates.seniorityLevel !== undefined) dbUpdates.seniority_level = updates.seniorityLevel
    if (updates.businessStage !== undefined) dbUpdates.business_stage = updates.businessStage
    if (updates.companySize !== undefined) dbUpdates.company_size = updates.companySize
    if (updates.industry !== undefined) dbUpdates.industry = updates.industry
    if (updates.priorityAreas !== undefined) dbUpdates.priority_areas = updates.priorityAreas
    if (updates.preferredCategories !== undefined) dbUpdates.preferred_signal_categories = updates.preferredCategories
    if (updates.pinnedSignals !== undefined) dbUpdates.pinned_signals = updates.pinnedSignals
    if (updates.hiddenSignals !== undefined) dbUpdates.hidden_signals = updates.hiddenSignals
    
    // Upsert - create if doesn't exist
    const { error } = await supabase
      .from('user_context')
      .upsert({
        user_id: userId,
        ...dbUpdates
      }, {
        onConflict: 'user_id'
      })
    
    if (error) {
      console.error('[UserContextService] Error updating context:', error)
      return false
    }
    
    return true
  }
  
  /**
   * Add a goal
   */
  static async addGoal(
    userId: string,
    goal: Omit<UserGoal, 'id' | 'status'> & { organizationId?: string }
  ): Promise<string | null> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('user_goals')
      .insert({
        user_id: userId,
        organization_id: goal.organizationId,
        title: goal.title,
        description: goal.description,
        signal_id: goal.signalId,
        signal_name: goal.signalName,
        target_value: goal.targetValue,
        target_direction: goal.targetDirection,
        target_date: goal.targetDate,
        priority: goal.priority || 1,
        status: 'active'
      })
      .select('id')
      .single()
    
    if (error) {
      console.error('[UserContextService] Error adding goal:', error)
      return null
    }
    
    return data.id
  }
  
  /**
   * Pin a signal
   */
  static async pinSignal(userId: string, signalId: string): Promise<boolean> {
    const context = await this.getUserContext(userId)
    if (!context) return false
    
    const pinnedSignals = [...context.pinnedSignals]
    if (!pinnedSignals.includes(signalId)) {
      pinnedSignals.push(signalId)
    }
    
    return this.updateUserContext(userId, { pinnedSignals })
  }
  
  /**
   * Unpin a signal
   */
  static async unpinSignal(userId: string, signalId: string): Promise<boolean> {
    const context = await this.getUserContext(userId)
    if (!context) return false
    
    const pinnedSignals = context.pinnedSignals.filter(id => id !== signalId)
    return this.updateUserContext(userId, { pinnedSignals })
  }
  
  /**
   * Hide a signal
   */
  static async hideSignal(userId: string, signalId: string): Promise<boolean> {
    const context = await this.getUserContext(userId)
    if (!context) return false
    
    const hiddenSignals = [...context.hiddenSignals]
    if (!hiddenSignals.includes(signalId)) {
      hiddenSignals.push(signalId)
    }
    
    return this.updateUserContext(userId, { hiddenSignals })
  }
  
  /**
   * Unhide a signal
   */
  static async unhideSignal(userId: string, signalId: string): Promise<boolean> {
    const context = await this.getUserContext(userId)
    if (!context) return false
    
    const hiddenSignals = context.hiddenSignals.filter(id => id !== signalId)
    return this.updateUserContext(userId, { hiddenSignals })
  }
  
  /**
   * Get role-based signal relevance mappings
   * Used to determine which signals are important for which roles
   */
  static async getRoleSignalRelevance(role: string): Promise<RoleSignalRelevance[]> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('role_signal_relevance')
      .select('role, signal_category, relevance_score, is_core_metric')
      .eq('role', role)
      .order('relevance_score', { ascending: false })
    
    if (error) {
      console.error('[UserContextService] Error fetching role relevance:', error)
      return []
    }
    
    return (data || []).map(r => ({
      role: r.role,
      signalCategory: r.signal_category,
      relevanceScore: r.relevance_score,
      isCoreMetric: r.is_core_metric
    }))
  }
  
  /**
   * Get all role mappings for signal ranking
   */
  static async getAllRoleRelevance(): Promise<Map<string, RoleSignalRelevance[]>> {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('role_signal_relevance')
      .select('role, signal_category, relevance_score, is_core_metric')
      .order('role')
      .order('relevance_score', { ascending: false })
    
    if (error) {
      console.error('[UserContextService] Error fetching all role relevance:', error)
      return new Map()
    }
    
    const roleMap = new Map<string, RoleSignalRelevance[]>()
    
    for (const r of data || []) {
      const relevance = {
        role: r.role,
        signalCategory: r.signal_category,
        relevanceScore: r.relevance_score,
        isCoreMetric: r.is_core_metric
      }
      
      if (!roleMap.has(r.role)) {
        roleMap.set(r.role, [])
      }
      roleMap.get(r.role)!.push(relevance)
    }
    
    return roleMap
  }
  
  /**
   * Log user activity (for learning preferences over time)
   */
  static async logActivity(
    userId: string,
    activityType: string,
    entityType?: string,
    entityId?: string,
    entityName?: string,
    context?: Record<string, any>
  ): Promise<void> {
    const supabase = await createClient()
    
    await supabase.from('user_activity_log').insert({
      user_id: userId,
      activity_type: activityType,
      entity_type: entityType,
      entity_id: entityId,
      entity_name: entityName,
      context: context || {}
    })
  }
  
  // Helper to infer seniority from role title
  private static inferSeniority(role?: string): string {
    if (!role) return 'Manager'
    
    const roleLower = role.toLowerCase()
    
    if (
      roleLower.includes('ceo') ||
      roleLower.includes('cto') ||
      roleLower.includes('cfo') ||
      roleLower.includes('cmo') ||
      roleLower.includes('coo') ||
      roleLower.includes('chief') ||
      roleLower.includes('founder') ||
      roleLower.includes('president') ||
      roleLower.includes('vp') ||
      roleLower.includes('vice president')
    ) {
      return 'Executive'
    }
    
    if (
      roleLower.includes('director') ||
      roleLower.includes('head of')
    ) {
      return 'Director'
    }
    
    if (
      roleLower.includes('manager') ||
      roleLower.includes('lead') ||
      roleLower.includes('team lead')
    ) {
      return 'Manager'
    }
    
    return 'Individual Contributor'
  }
}
