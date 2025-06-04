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

    const integrationService = IntegrationService.getInstance()
    await integrationService.loadUserIntegrations(session.user.email)

    const integrations = integrationService.getIntegrationsByUser(session.user.email)

    return NextResponse.json({
      integrations: integrations.map((integration) => ({
        id: integration.id,
        integrationId: integration.integrationId,
        accountEmail: integration.accountEmail,
        accountName: integration.accountName,
        provider: integration.accountProvider,
        isEnabled: integration.isEnabled,
        connectedAt: integration.connectedAt,
        lastUsed: integration.lastUsed,
      })),
    })
  } catch (error) {
    console.error("Error fetching integrations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { integrationId, accountId, accountData } = await request.json()

    const integrationService = IntegrationService.getInstance()
    await integrationService.loadUserIntegrations(session.user.email)

    const newIntegrationId = await integrationService.connectIntegration(
      session.user.email,
      integrationId,
      accountId,
      accountData,
    )

    return NextResponse.json({
      success: true,
      integrationId: newIntegrationId,
    })
  } catch (error) {
    console.error("Error connecting integration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { integrationId, enabled } = await request.json()

    const integrationService = IntegrationService.getInstance()
    await integrationService.loadUserIntegrations(session.user.email)
    await integrationService.toggleIntegration(integrationId, enabled)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating integration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const integrationId = searchParams.get("integrationId")

    if (!integrationId) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 })
    }

    const integrationService = IntegrationService.getInstance()
    await integrationService.loadUserIntegrations(session.user.email)
    await integrationService.disconnectIntegration(integrationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error disconnecting integration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
