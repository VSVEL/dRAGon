import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PluginManager } from "@/lib/plugins/plugin-manager"
import { IntegrationService } from "@/lib/integration-service"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const integrationService = IntegrationService.getInstance()
    await integrationService.loadUserIntegrations(session.user.email)

    const enabledIntegrations = integrationService.getEnabledIntegrations(session.user.email)
    const pluginManager = new PluginManager()

    const contextData: Record<string, any> = {}

    // Fetch data for each enabled integration using account-specific tokens
    for (const integration of enabledIntegrations) {
      try {
        const plugin = pluginManager.getPlugin(integration.integrationId)
        if (plugin) {
          const data = await plugin.fetchData(integration.accessToken)
          contextData[`${integration.integrationId}_${integration.accountEmail}`] = {
            account: {
              email: integration.accountEmail,
              name: integration.accountName,
              provider: integration.accountProvider,
            },
            data,
            lastUsed: integration.lastUsed,
          }

          // Update last used timestamp
          await integrationService.updateLastUsed(integration.id)
        }
      } catch (error) {
        console.error(`Error fetching data for ${integration.integrationId} (${integration.accountEmail}):`, error)
        contextData[`${integration.integrationId}_${integration.accountEmail}`] = {
          account: {
            email: integration.accountEmail,
            name: integration.accountName,
            provider: integration.accountProvider,
          },
          error: error.message,
        }
      }
    }

    return NextResponse.json({
      data: contextData,
      integrations: enabledIntegrations.map((integration) => ({
        id: integration.id,
        integrationId: integration.integrationId,
        accountEmail: integration.accountEmail,
        accountName: integration.accountName,
        provider: integration.accountProvider,
        isEnabled: integration.isEnabled,
        connectedAt: integration.connectedAt,
        lastUsed: integration.lastUsed,
      })),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching context:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
