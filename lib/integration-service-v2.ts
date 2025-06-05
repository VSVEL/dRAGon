import { db } from "./database/db"
import type { StoredIntegration } from "./database/integration-storage"

export class IntegrationServiceV2 {
  private static instance: IntegrationServiceV2

  static getInstance(): IntegrationServiceV2 {
    if (!IntegrationServiceV2.instance) {
      IntegrationServiceV2.instance = new IntegrationServiceV2()
    }
    return IntegrationServiceV2.instance
  }

  // Save integration to persistent storage
  async saveIntegration(
    userId: string,
    integration: Omit<StoredIntegration, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    try {
      // Check if integration already exists
      const existing = await this.getIntegrationByProvider(userId, integration.provider, integration.accountId)

      if (existing) {
        // Update existing integration
        await this.updateIntegration(existing.id, {
          ...integration,
          isActive: true,
          updatedAt: new Date(),
        })
        return existing.id
      } else {
        // Create new integration
        const integrationData: StoredIntegration = {
          ...integration,
          id: "", // Will be set by db.create
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        const id = await db.create("integrations", userId, integrationData)
        return id
      }
    } catch (error) {
      console.error("Error saving integration:", error)
      throw error
    }
  }

  // Get all integrations for a user
  async getUserIntegrations(userId: string): Promise<StoredIntegration[]> {
    try {
      const records = await db.findByUserId("integrations", userId)
      return records
        .map((record) => ({
          ...record.data,
          id: record.id,
        }))
        .filter((integration) => integration.isActive)
    } catch (error) {
      console.error("Error fetching user integrations:", error)
      return []
    }
  }

  // Get integration by provider and account
  async getIntegrationByProvider(
    userId: string,
    provider: string,
    accountId: string,
  ): Promise<StoredIntegration | null> {
    try {
      const integrations = await this.getUserIntegrations(userId)
      return integrations.find((i) => i.provider === provider && i.accountId === accountId) || null
    } catch (error) {
      console.error("Error finding integration by provider:", error)
      return null
    }
  }

  // Update integration
  async updateIntegration(integrationId: string, updates: Partial<StoredIntegration>): Promise<void> {
    try {
      await db.update(integrationId, updates)
    } catch (error) {
      console.error("Error updating integration:", error)
      throw error
    }
  }

  // Delete integration
  async deleteIntegration(integrationId: string): Promise<void> {
    try {
      await db.update(integrationId, { isActive: false })
    } catch (error) {
      console.error("Error deleting integration:", error)
      throw error
    }
  }

  // Enable/disable integration
  async toggleIntegration(integrationId: string, enabled: boolean): Promise<void> {
    try {
      await db.update(integrationId, { isEnabled: enabled })
    } catch (error) {
      console.error("Error toggling integration:", error)
      throw error
    }
  }

  // Get integration statistics
  async getIntegrationStats(userId: string): Promise<{
    total: number
    active: number
    byProvider: Record<string, number>
    recentlyUsed: StoredIntegration[]
  }> {
    try {
      const integrations = await this.getUserIntegrations(userId)
      const active = integrations.filter((i) => i.isEnabled)

      const byProvider = integrations.reduce(
        (acc, integration) => {
          acc[integration.provider] = (acc[integration.provider] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const recentlyUsed = integrations
        .filter((i) => i.metadata.lastUsedAt)
        .sort((a, b) => {
          const aTime = a.metadata.lastUsedAt ? new Date(a.metadata.lastUsedAt).getTime() : 0
          const bTime = b.metadata.lastUsedAt ? new Date(b.metadata.lastUsedAt).getTime() : 0
          return bTime - aTime
        })
        .slice(0, 5)

      return {
        total: integrations.length,
        active: active.length,
        byProvider,
        recentlyUsed,
      }
    } catch (error) {
      console.error("Error getting integration stats:", error)
      return { total: 0, active: 0, byProvider: {}, recentlyUsed: [] }
    }
  }

  // Restore user session with integrations
  async restoreUserSession(userId: string): Promise<{
    integrations: StoredIntegration[]
    stats: any
    restored: boolean
  }> {
    try {
      const integrations = await this.getUserIntegrations(userId)
      const stats = await this.getIntegrationStats(userId)

      // Mark integrations as recently accessed
      for (const integration of integrations.filter((i) => i.isEnabled)) {
        await this.updateIntegration(integration.id, {
          metadata: {
            ...integration.metadata,
            lastUsedAt: new Date(),
          },
        })
      }

      return {
        integrations,
        stats,
        restored: integrations.length > 0,
      }
    } catch (error) {
      console.error("Error restoring user session:", error)
      return { integrations: [], stats: {}, restored: false }
    }
  }
}
