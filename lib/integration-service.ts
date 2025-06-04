interface AccountIntegration {
  id: string
  userId: string
  integrationId: string
  accountId: string
  accountProvider: string
  accountEmail: string
  accountName: string
  accessToken: string
  refreshToken?: string
  isEnabled: boolean
  settings: Record<string, any>
  connectedAt: Date
  lastUsed?: Date
}

export class IntegrationService {
  private static instance: IntegrationService
  private integrations: Map<string, AccountIntegration> = new Map()

  static getInstance(): IntegrationService {
    if (!IntegrationService.instance) {
      IntegrationService.instance = new IntegrationService()
    }
    return IntegrationService.instance
  }

  async loadUserIntegrations(userId: string): Promise<void> {
    try {
      // In real implementation, this would fetch from database
      const stored = localStorage.getItem(`integrations_${userId}`)
      if (stored) {
        const integrations: AccountIntegration[] = JSON.parse(stored)
        integrations.forEach((integration) => {
          this.integrations.set(integration.id, integration)
        })
      }
    } catch (error) {
      console.error("Error loading user integrations:", error)
    }
  }

  async saveUserIntegrations(userId: string): Promise<void> {
    try {
      const userIntegrations = Array.from(this.integrations.values()).filter(
        (integration) => integration.userId === userId,
      )
      localStorage.setItem(`integrations_${userId}`, JSON.stringify(userIntegrations))
    } catch (error) {
      console.error("Error saving user integrations:", error)
    }
  }

  async connectIntegration(
    userId: string,
    integrationId: string,
    accountId: string,
    accountData: {
      provider: string
      email: string
      name: string
      accessToken: string
      refreshToken?: string
    },
  ): Promise<string> {
    const integration: AccountIntegration = {
      id: `${userId}_${integrationId}_${accountId}`,
      userId,
      integrationId,
      accountId,
      accountProvider: accountData.provider,
      accountEmail: accountData.email,
      accountName: accountData.name,
      accessToken: accountData.accessToken,
      refreshToken: accountData.refreshToken,
      isEnabled: true,
      settings: {},
      connectedAt: new Date(),
    }

    this.integrations.set(integration.id, integration)
    await this.saveUserIntegrations(userId)

    return integration.id
  }

  async disconnectIntegration(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId)
    if (integration) {
      this.integrations.delete(integrationId)
      await this.saveUserIntegrations(integration.userId)
    }
  }

  async toggleIntegration(integrationId: string, enabled: boolean): Promise<void> {
    const integration = this.integrations.get(integrationId)
    if (integration) {
      integration.isEnabled = enabled
      integration.lastUsed = new Date()
      await this.saveUserIntegrations(integration.userId)
    }
  }

  getIntegrationsByUser(userId: string): AccountIntegration[] {
    return Array.from(this.integrations.values()).filter((integration) => integration.userId === userId)
  }

  getEnabledIntegrations(userId: string): AccountIntegration[] {
    return this.getIntegrationsByUser(userId).filter((integration) => integration.isEnabled)
  }

  getIntegrationsByType(userId: string, integrationId: string): AccountIntegration[] {
    return this.getIntegrationsByUser(userId).filter((integration) => integration.integrationId === integrationId)
  }

  getAccessToken(userId: string, integrationId: string, accountId?: string): string | null {
    const integrations = this.getIntegrationsByType(userId, integrationId)

    if (accountId) {
      const specific = integrations.find((i) => i.accountId === accountId && i.isEnabled)
      return specific?.accessToken || null
    }

    // Return the first enabled integration's token
    const enabled = integrations.find((i) => i.isEnabled)
    return enabled?.accessToken || null
  }

  async updateLastUsed(integrationId: string): Promise<void> {
    const integration = this.integrations.get(integrationId)
    if (integration) {
      integration.lastUsed = new Date()
      await this.saveUserIntegrations(integration.userId)
    }
  }
}
