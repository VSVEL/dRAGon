import type { BasePlugin } from "./base-plugin"
import { GmailPlugin } from "./gmail-plugin"
import { CalendarPlugin } from "./calendar-plugin"

export class PluginManager {
  private plugins: Map<string, BasePlugin> = new Map()

  constructor() {
    this.registerPlugin(new GmailPlugin())
    this.registerPlugin(new CalendarPlugin())
  }

  registerPlugin(plugin: BasePlugin) {
    this.plugins.set(plugin.id, plugin)
  }

  getPlugin(id: string): BasePlugin | undefined {
    return this.plugins.get(id)
  }

  getEnabledPlugins(): BasePlugin[] {
    return Array.from(this.plugins.values()).filter((plugin) => plugin.isEnabled())
  }

  async fetchAllData(accessToken: string): Promise<Record<string, any>> {
    const data: Record<string, any> = {}
    const enabledPlugins = this.getEnabledPlugins()

    for (const plugin of enabledPlugins) {
      try {
        data[plugin.id] = await plugin.fetchData(accessToken)
      } catch (error) {
        console.error(`Error fetching data for ${plugin.name}:`, error)
        data[plugin.id] = []
      }
    }

    return data
  }

  formatDataForAI(data: Record<string, any>): string {
    const enabledPlugins = this.getEnabledPlugins()
    const formattedSections: string[] = []

    for (const plugin of enabledPlugins) {
      if (data[plugin.id]) {
        formattedSections.push(plugin.formatForAI(data[plugin.id]))
      }
    }

    return formattedSections.join("\n\n---\n\n")
  }
}
