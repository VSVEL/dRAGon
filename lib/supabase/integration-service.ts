import { supabase } from "./client"

export interface Integration {
  id: string
  user_id: string
  integration_id: string
  integration_name: string
  provider: string
  account_id: string
  account_email?: string
  account_name?: string
  account_avatar?: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  scopes: string[]
  is_enabled: boolean
  is_active: boolean
  settings: Record<string, any>
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface IntegrationSession {
  id: string
  user_id: string
  session_data: Record<string, any>
  created_at: string
  updated_at: string
}

export interface IntegrationUsageLog {
  id: string
  user_id: string
  integration_id: string
  action: string
  details: Record<string, any>
  timestamp: string
}

export class SupabaseIntegrationService {
  // Create or update integration
  async saveIntegration(integration: Omit<Integration, "id" | "created_at" | "updated_at">): Promise<string> {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .upsert(
          {
            ...integration,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,provider,account_id",
            ignoreDuplicates: false,
          },
        )
        .select("id")
        .single()

      if (error) {
        console.error("Error saving integration:", error)
        throw error
      }

      return data.id
    } catch (error) {
      console.error("Error saving integration:", error)
      throw error
    }
  }

  // Get all active integrations for a user
  async getUserIntegrations(userId: string): Promise<Integration[]> {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching user integrations:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching user integrations:", error)
      return []
    }
  }

  // Get integration by provider and account
  async getIntegrationByProvider(userId: string, provider: string, accountId: string): Promise<Integration | null> {
    try {
      const { data, error } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", userId)
        .eq("provider", provider)
        .eq("account_id", accountId)
        .eq("is_active", true)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null
        }
        console.error("Error finding integration by provider:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error finding integration by provider:", error)
      return null
    }
  }

  // Update integration
  async updateIntegration(integrationId: string, updates: Partial<Integration>): Promise<void> {
    try {
      const { error } = await supabase
        .from("integrations")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", integrationId)

      if (error) {
        console.error("Error updating integration:", error)
        throw error
      }
    } catch (error) {
      console.error("Error updating integration:", error)
      throw error
    }
  }

  // Soft delete integration
  async deleteIntegration(integrationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("integrations")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", integrationId)

      if (error) {
        console.error("Error deleting integration:", error)
        throw error
      }
    } catch (error) {
      console.error("Error deleting integration:", error)
      throw error
    }
  }

  // Get integration statistics
  async getIntegrationStats(userId: string): Promise<{
    total: number
    active: number
    byProvider: Record<string, number>
    recentlyUsed: Integration[]
  }> {
    try {
      // Get total and active counts
      const { data: countData, error: countError } = await supabase
        .from("integrations")
        .select("id, is_enabled")
        .eq("user_id", userId)
        .eq("is_active", true)

      if (countError) {
        console.error("Error getting integration counts:", countError)
        return { total: 0, active: 0, byProvider: {}, recentlyUsed: [] }
      }

      const total = countData?.length || 0
      const active = countData?.filter((item) => item.is_enabled).length || 0

      // Get provider breakdown
      const { data: providerData, error: providerError } = await supabase
        .from("integrations")
        .select("provider")
        .eq("user_id", userId)
        .eq("is_active", true)

      const byProvider =
        providerData?.reduce(
          (acc, item) => {
            acc[item.provider] = (acc[item.provider] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      // Get recently used integrations (based on metadata.lastUsedAt)
      const { data: recentData, error: recentError } = await supabase
        .from("integrations")
        .select("*")
        .eq("user_id", userId)
        .eq("is_active", true)
        .not("metadata->lastUsedAt", "is", null)
        .order("metadata->lastUsedAt", { ascending: false })
        .limit(5)

      const recentlyUsed = recentData || []

      return {
        total,
        active,
        byProvider,
        recentlyUsed,
      }
    } catch (error) {
      console.error("Error getting integration stats:", error)
      return { total: 0, active: 0, byProvider: {}, recentlyUsed: [] }
    }
  }

  // Log integration usage
  async logIntegrationUsage(
    userId: string,
    integrationId: string,
    action: string,
    details: Record<string, any> = {},
  ): Promise<void> {
    try {
      const { error } = await supabase.from("integration_usage_logs").insert({
        user_id: userId,
        integration_id: integrationId,
        action,
        details,
      })

      if (error) {
        console.error("Error logging integration usage:", error)
      }
    } catch (error) {
      console.error("Error logging integration usage:", error)
    }
  }

  // Save/update user session
  async saveUserSession(userId: string, sessionData: Record<string, any>): Promise<void> {
    try {
      const { error } = await supabase.from("integration_sessions").upsert(
        {
          user_id: userId,
          session_data: sessionData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )

      if (error) {
        console.error("Error saving user session:", error)
        throw error
      }
    } catch (error) {
      console.error("Error saving user session:", error)
      throw error
    }
  }

  // Get user session
  async getUserSession(userId: string): Promise<IntegrationSession | null> {
    try {
      const { data, error } = await supabase.from("integration_sessions").select("*").eq("user_id", userId).single()

      if (error) {
        if (error.code === "PGRST116") {
          // No rows returned
          return null
        }
        console.error("Error getting user session:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("Error getting user session:", error)
      return null
    }
  }

  // Get usage analytics
  async getUsageAnalytics(
    userId: string,
    days = 30,
  ): Promise<{
    totalActions: number
    actionBreakdown: Record<string, number>
    dailyUsage: Array<{ date: string; count: number }>
  }> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const { data, error } = await supabase
        .from("integration_usage_logs")
        .select("action, timestamp")
        .eq("user_id", userId)
        .gte("timestamp", startDate.toISOString())
        .order("timestamp", { ascending: false })

      if (error) {
        console.error("Error getting usage analytics:", error)
        return { totalActions: 0, actionBreakdown: {}, dailyUsage: [] }
      }

      const totalActions = data?.length || 0

      const actionBreakdown =
        data?.reduce(
          (acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ) || {}

      // Group by day for daily usage
      const dailyUsage =
        data?.reduce(
          (acc, log) => {
            const date = new Date(log.timestamp).toISOString().split("T")[0]
            const existing = acc.find((item) => item.date === date)
            if (existing) {
              existing.count++
            } else {
              acc.push({ date, count: 1 })
            }
            return acc
          },
          [] as Array<{ date: string; count: number }>,
        ) || []

      return {
        totalActions,
        actionBreakdown,
        dailyUsage: dailyUsage.sort((a, b) => a.date.localeCompare(b.date)),
      }
    } catch (error) {
      console.error("Error getting usage analytics:", error)
      return { totalActions: 0, actionBreakdown: {}, dailyUsage: [] }
    }
  }
}

export const supabaseIntegrationService = new SupabaseIntegrationService()
