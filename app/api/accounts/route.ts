import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { IntegrationService } from "@/lib/integration-service"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const provider = searchParams.get("provider")

    const integrationService = IntegrationService.getInstance()
    await integrationService.loadUserIntegrations(session.user.email)

    const integrations = integrationService.getIntegrationsByUser(session.user.email)

    // Group integrations by account
    const accountMap = new Map()

    integrations.forEach((integration) => {
      if (!provider || integration.accountProvider === provider) {
        const accountKey = `${integration.accountProvider}_${integration.accountId}`

        if (!accountMap.has(accountKey)) {
          accountMap.set(accountKey, {
            id: integration.accountId,
            provider: integration.accountProvider,
            email: integration.accountEmail,
            name: integration.accountName,
            isActive: integration.isEnabled,
            connectedAt: integration.connectedAt,
            integrations: [],
          })
        }

        accountMap.get(accountKey).integrations.push({
          id: integration.id,
          integrationId: integration.integrationId,
          isEnabled: integration.isEnabled,
        })
      }
    })

    const accounts = Array.from(accountMap.values())

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
