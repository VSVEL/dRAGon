import type { BasePlugin } from "./base-plugin"
import { GmailPlugin } from "./gmail-plugin"
import { CalendarPlugin } from "./calendar-plugin"
import { GitHubPlugin } from "./github-plugin"
import { AccountManager } from "../account-manager"
import type { UserAccount } from "../database/schema"

export class MultiAccountPluginManager {
  private plugins: Map<string, BasePlugin> = new Map()
  private accountManager: AccountManager

  constructor(userId: string) {
    this.accountManager = new AccountManager(userId)
    this.registerPlugin(new GmailPlugin())
    this.registerPlugin(new CalendarPlugin())
    this.registerPlugin(new GitHubPlugin())
  }

  async initialize(): Promise<void> {
    await this.accountManager.loadUserAccounts()
  }

  registerPlugin(plugin: BasePlugin) {
    this.plugins.set(plugin.id, plugin)
  }

  getPlugin(id: string): BasePlugin | undefined {
    return this.plugins.get(id)
  }

  getAccountManager(): AccountManager {
    return this.accountManager
  }

  async fetchAllData(): Promise<Record<string, any>> {
    const data: Record<string, any> = {}
    const enabledIntegrations = this.accountManager.getAllEnabledIntegrations()

    for (const { account, integrations } of enabledIntegrations) {
      for (const integration of integrations) {
        const plugin = this.plugins.get(integration.integrationId)
        if (plugin && account.accessToken) {
          try {
            const pluginData = await plugin.fetchData(account.accessToken)
            const key = `${account.provider}_${account.accountEmail}_${plugin.id}`
            data[key] = {
              account: {
                provider: account.provider,
                email: account.accountEmail,
                name: account.accountName,
              },
              data: pluginData,
            }
          } catch (error) {
            console.error(`Error fetching data for ${plugin.name} (${account.accountEmail}):`, error)
            data[`${account.provider}_${account.accountEmail}_${plugin.id}`] = {
              account: {
                provider: account.provider,
                email: account.accountEmail,
                name: account.accountName,
              },
              error: error.message,
            }
          }
        }
      }
    }

    return data
  }

  formatDataForAI(data: Record<string, any>): string {
    const formattedSections: string[] = []

    for (const [key, value] of Object.entries(data)) {
      if (value.error) {
        formattedSections.push(`Error fetching data from ${value.account.email}: ${value.error}`)
        continue
      }

      const [provider, email, pluginId] = key.split("_")
      const plugin = this.plugins.get(pluginId)

      if (plugin && value.data) {
        const formattedData = plugin.formatForAI(value.data)
        formattedSections.push(`${plugin.name} (${email}):\n${formattedData}`)
      }
    }

    return formattedSections.length > 0
      ? formattedSections.join("\n\n---\n\n")
      : "No data available from connected accounts."
  }

  addAccount(account: UserAccount): void {
    this.accountManager.addAccount(account)
  }

  removeAccount(accountId: string): void {
    this.accountManager.removeAccount(accountId)
  }

  enableIntegration(accountId: string, integrationId: string, settings: Record<string, any> = {}): void {
    this.accountManager.enableIntegration(accountId, integrationId, settings)
  }

  disableIntegration(accountId: string, integrationId: string): void {
    this.accountManager.disableIntegration(accountId, integrationId)
  }
}
