import type { UserAccount, UserIntegration } from "./database/schema"

export class AccountManager {
  private accounts: Map<string, UserAccount> = new Map()
  private integrations: Map<string, UserIntegration[]> = new Map()

  constructor(private userId: string) {}

  async loadUserAccounts(): Promise<void> {
    // In a real implementation, this would fetch from database
    // For now, we'll simulate with localStorage or session data
    try {
      const accountsData = localStorage.getItem(`accounts_${this.userId}`)
      if (accountsData) {
        const accounts: UserAccount[] = JSON.parse(accountsData)
        accounts.forEach((account) => {
          this.accounts.set(account.id, account)
        })
      }

      const integrationsData = localStorage.getItem(`integrations_${this.userId}`)
      if (integrationsData) {
        const integrations: UserIntegration[] = JSON.parse(integrationsData)
        integrations.forEach((integration) => {
          const accountIntegrations = this.integrations.get(integration.accountId) || []
          accountIntegrations.push(integration)
          this.integrations.set(integration.accountId, accountIntegrations)
        })
      }
    } catch (error) {
      console.error("Error loading user accounts:", error)
    }
  }

  async saveUserAccounts(): Promise<void> {
    try {
      const accounts = Array.from(this.accounts.values())
      localStorage.setItem(`accounts_${this.userId}`, JSON.stringify(accounts))

      const allIntegrations = Array.from(this.integrations.values()).flat()
      localStorage.setItem(`integrations_${this.userId}`, JSON.stringify(allIntegrations))
    } catch (error) {
      console.error("Error saving user accounts:", error)
    }
  }

  addAccount(account: UserAccount): void {
    this.accounts.set(account.id, account)
    this.saveUserAccounts()
  }

  removeAccount(accountId: string): void {
    this.accounts.delete(accountId)
    this.integrations.delete(accountId)
    this.saveUserAccounts()
  }

  getAccount(accountId: string): UserAccount | undefined {
    return this.accounts.get(accountId)
  }

  getAccountsByProvider(provider: UserAccount["provider"]): UserAccount[] {
    return Array.from(this.accounts.values()).filter((account) => account.provider === provider)
  }

  getAllAccounts(): UserAccount[] {
    return Array.from(this.accounts.values())
  }

  enableIntegration(accountId: string, integrationId: string, settings: Record<string, any> = {}): void {
    const accountIntegrations = this.integrations.get(accountId) || []
    const existingIntegration = accountIntegrations.find((i) => i.integrationId === integrationId)

    if (existingIntegration) {
      existingIntegration.isEnabled = true
      existingIntegration.settings = settings
    } else {
      const newIntegration: UserIntegration = {
        id: `${accountId}_${integrationId}_${Date.now()}`,
        userId: this.userId,
        accountId,
        integrationId,
        isEnabled: true,
        settings,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      accountIntegrations.push(newIntegration)
    }

    this.integrations.set(accountId, accountIntegrations)
    this.saveUserAccounts()
  }

  disableIntegration(accountId: string, integrationId: string): void {
    const accountIntegrations = this.integrations.get(accountId) || []
    const integration = accountIntegrations.find((i) => i.integrationId === integrationId)

    if (integration) {
      integration.isEnabled = false
      this.saveUserAccounts()
    }
  }

  getEnabledIntegrations(accountId: string): UserIntegration[] {
    const accountIntegrations = this.integrations.get(accountId) || []
    return accountIntegrations.filter((i) => i.isEnabled)
  }

  getAllEnabledIntegrations(): Array<{ account: UserAccount; integrations: UserIntegration[] }> {
    const result: Array<{ account: UserAccount; integrations: UserIntegration[] }> = []

    for (const account of this.accounts.values()) {
      const enabledIntegrations = this.getEnabledIntegrations(account.id)
      if (enabledIntegrations.length > 0) {
        result.push({ account, integrations: enabledIntegrations })
      }
    }

    return result
  }

  isIntegrationEnabled(accountId: string, integrationId: string): boolean {
    const accountIntegrations = this.integrations.get(accountId) || []
    const integration = accountIntegrations.find((i) => i.integrationId === integrationId)
    return integration?.isEnabled || false
  }
}
