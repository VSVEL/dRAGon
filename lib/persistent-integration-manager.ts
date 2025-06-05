import type { StoredIntegration, IntegrationSession, IntegrationUsageLog } from "./database/integration-storage"

export class PersistentIntegrationManager {
  private static instance: PersistentIntegrationManager
  private integrations: Map<string, StoredIntegration> = new Map()
  private sessions: Map<string, IntegrationSession> = new Map()
  private usageLogs: IntegrationUsageLog[] = []

  static getInstance(): PersistentIntegrationManager {
    if (!PersistentIntegrationManager.instance) {
      PersistentIntegrationManager.instance = new PersistentIntegrationManager()
    }
    return PersistentIntegrationManager.instance
  }

  // Load user's integration history from storage
  async loadUserIntegrations(userId: string): Promise<void> {
    try {
      // In production, this would be a database call
      // For now, using localStorage with fallback to IndexedDB for larger data
      const stored = localStorage.getItem(`dragon_integrations_${userId}`)
      if (stored) {
        const integrations: StoredIntegration[] = JSON.parse(stored)
        integrations.forEach((integration) => {
          this.integrations.set(integration.id, integration)
        })
      }

      // Load session data
      const sessionData = localStorage.getItem(`dragon_session_${userId}`)
      if (sessionData) {
        const session: IntegrationSession = JSON.parse(sessionData)
        this.sessions.set(userId, session)
      }

      // Load usage logs
      const logsData = localStorage.getItem(`dragon_logs_${userId}`)
      if (logsData) {
        this.usageLogs = JSON.parse(logsData)
      }
    } catch (error) {
      console.error("Error loading user integrations:", error)
    }
  }

  // Save all data to persistent storage
  async saveUserData(userId: string): Promise<void> {
    try {
      // Save integrations
      const userIntegrations = Array.from(this.integrations.values()).filter(
        (integration) => integration.userId === userId,
      )
      localStorage.setItem(`dragon_integrations_${userId}`, JSON.stringify(userIntegrations))

      // Save session
      const session = this.sessions.get(userId)
      if (session) {
        localStorage.setItem(`dragon_session_${userId}`, JSON.stringify(session))
      }

      // Save usage logs (keep last 1000 entries)
      const userLogs = this.usageLogs.filter((log) => log.userId === userId).slice(-1000)
      localStorage.setItem(`dragon_logs_${userId}`, JSON.stringify(userLogs))
    } catch (error) {
      console.error("Error saving user data:", error)
    }
  }

  // Add or update an integration
  async addIntegration(integration: Omit<StoredIntegration, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const id = `${integration.userId}_${integration.integrationId}_${integration.accountId}_${Date.now()}`
    const storedIntegration: StoredIntegration = {
      ...integration,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.integrations.set(id, storedIntegration)
    await this.saveUserData(integration.userId)
    await this.logUsage(integration.userId, integration.integrationId, "connect", {
      accountEmail: integration.accountEmail,
      provider: integration.provider,
    })

    return id
  }

  // Update integration status
  async updateIntegration(integrationId: string, updates: Partial<StoredIntegration>): Promise<void> {
    const integration = this.integrations.get(integrationId)
    if (integration) {
      const updatedIntegration = {
        ...integration,
        ...updates,
        updatedAt: new Date(),
      }
      this.integrations.set(integrationId, updatedIntegration)
      await this.saveUserData(integration.userId)
    }
  }

  // Remove an integration
  async removeIntegration(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId)
    if (integration) {
      this.integrations.delete(integrationId)
      await this.saveUserData(integration.userId)
      await this.logUsage(integration.userId, integration.integrationId, "disconnect", {
        accountEmail: integration.accountEmail,
      })
    }
  }

  // Get user's integrations with history
  getUserIntegrations(userId: string): StoredIntegration[] {
    return Array.from(this.integrations.values())
      .filter((integration) => integration.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  // Get active integrations
  getActiveIntegrations(userId: string): StoredIntegration[] {
    return this.getUserIntegrations(userId).filter((integration) => integration.isEnabled && integration.isActive)
  }

  // Get integrations by provider
  getIntegrationsByProvider(userId: string, provider: string): StoredIntegration[] {
    return this.getUserIntegrations(userId).filter((integration) => integration.provider === provider)
  }

  // Update session data
  async updateSession(userId: string, sessionData: Partial<IntegrationSession["sessionData"]>): Promise<void> {
    const existingSession = this.sessions.get(userId)
    const session: IntegrationSession = {
      id: existingSession?.id || `session_${userId}_${Date.now()}`,
      userId,
      sessionData: {
        ...existingSession?.sessionData,
        ...sessionData,
      },
      createdAt: existingSession?.createdAt || new Date(),
      updatedAt: new Date(),
    }

    this.sessions.set(userId, session)
    await this.saveUserData(userId)
  }

  // Get session data
  getSession(userId: string): IntegrationSession | undefined {
    return this.sessions.get(userId)
  }

  // Log usage for analytics
  async logUsage(
    userId: string,
    integrationId: string,
    action: IntegrationUsageLog["action"],
    details: Record<string, any>,
  ): Promise<void> {
    const log: IntegrationUsageLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      integrationId,
      action,
      details,
      timestamp: new Date(),
    }

    this.usageLogs.push(log)

    // Update integration metadata
    const userIntegrations = this.getUserIntegrations(userId)
    const integration = userIntegrations.find((i) => i.integrationId === integrationId)
    if (integration) {
      await this.updateIntegration(integration.id, {
        metadata: {
          ...integration.metadata,
          lastUsedAt: new Date(),
          totalUsage: integration.metadata.totalUsage + 1,
        },
      })
    }
  }

  // Get usage history
  getUsageHistory(userId: string, integrationId?: string): IntegrationUsageLog[] {
    return this.usageLogs
      .filter((log) => log.userId === userId && (!integrationId || log.integrationId === integrationId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Get integration statistics
  getIntegrationStats(userId: string): {
    totalIntegrations: number
    activeIntegrations: number
    providerBreakdown: Record<string, number>
    usageStats: Record<string, number>
    recentActivity: IntegrationUsageLog[]
  } {
    const integrations = this.getUserIntegrations(userId)
    const activeIntegrations = this.getActiveIntegrations(userId)
    const recentLogs = this.getUsageHistory(userId).slice(0, 10)

    const providerBreakdown = integrations.reduce(
      (acc, integration) => {
        acc[integration.provider] = (acc[integration.provider] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const usageStats = recentLogs.reduce(
      (acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      totalIntegrations: integrations.length,
      activeIntegrations: activeIntegrations.length,
      providerBreakdown,
      usageStats,
      recentActivity: recentLogs,
    }
  }

  // Restore user's previous session
  async restoreUserSession(userId: string): Promise<{
    integrations: StoredIntegration[]
    session: IntegrationSession | undefined
    stats: any
  }> {
    await this.loadUserIntegrations(userId)

    const integrations = this.getUserIntegrations(userId)
    const session = this.getSession(userId)
    const stats = this.getIntegrationStats(userId)

    // Auto-enable previously active integrations
    const activeIntegrations = integrations.filter((i) => i.isEnabled)
    if (activeIntegrations.length > 0) {
      await this.updateSession(userId, {
        activeIntegrations: activeIntegrations.map((i) => i.id),
      })
    }

    return { integrations, session, stats }
  }
}
