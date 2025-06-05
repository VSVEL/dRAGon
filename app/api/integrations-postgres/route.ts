import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { postgresService } from "@/lib/database/postgres"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.email

    // Get integrations and stats
    const [integrations, stats, userSession] = await Promise.all([
      postgresService.getUserIntegrations(userId),
      postgresService.getIntegrationStats(userId),
      postgresService.getUserSession(userId),
    ])

    // Log session restoration
    if (integrations.length > 0) {
      for (const integration of integrations.filter((i) => i.is_enabled)) {
        await postgresService.logIntegrationUsage(userId, integration.id, "session_restore")

        // Update last used timestamp
        await postgresService.updateIntegration(integration.id, {
          metadata: {
            ...integration.metadata,
            lastUsedAt: new Date().toISOString(),
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        integrations,
        stats,
        session: userSession?.session_data || {},
        restored: integrations.length > 0,
      },
      message:
        integrations.length > 0
          ? `Welcome back! Restored ${integrations.length} integration(s)`
          : "No previous integrations found",
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

    const { integration } = await request.json()
    const userId = session.user.email

    // Save integration to Postgres
    const integrationId = await postgresService.saveIntegration({
      ...integration,
      user_id: userId,
      metadata: {
        ...integration.metadata,
        connectedAt: new Date().toISOString(),
        totalUsage: 0,
        errorCount: 0,
      },
    })

    // Log the connection
    await postgresService.logIntegrationUsage(userId, integrationId, "connect", {
      provider: integration.provider,
      accountId: integration.account_id,
    })

    return NextResponse.json({
      success: true,
      integrationId,
      message: `${integration.integration_name} connected successfully!`,
    })
  } catch (error) {
    console.error("Error saving integration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { integrationId, updates } = await request.json()
    const userId = session.user.email

    // Update integration
    await postgresService.updateIntegration(integrationId, {
      ...updates,
      metadata: {
        ...updates.metadata,
        lastModifiedAt: new Date().toISOString(),
      },
    })

    // Log the update
    await postgresService.logIntegrationUsage(userId, integrationId, "update", updates)

    return NextResponse.json({
      success: true,
      message: "Integration updated successfully",
    })
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

    const userId = session.user.email

    // Soft delete integration
    await postgresService.deleteIntegration(integrationId)

    // Log the disconnection
    await postgresService.logIntegrationUsage(userId, integrationId, "disconnect")

    return NextResponse.json({
      success: true,
      message: "Integration removed successfully",
    })
  } catch (error) {
    console.error("Error removing integration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
