import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PersistentIntegrationManager } from "@/lib/persistent-integration-manager"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const manager = PersistentIntegrationManager.getInstance()
    const userData = await manager.restoreUserSession(session.user.email)

    return NextResponse.json({
      success: true,
      data: userData,
    })
  } catch (error) {
    console.error("Error fetching persistent integrations:", error)
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
    const manager = PersistentIntegrationManager.getInstance()

    const integrationId = await manager.addIntegration({
      ...integration,
      userId: session.user.email,
    })

    return NextResponse.json({
      success: true,
      integrationId,
    })
  } catch (error) {
    console.error("Error adding persistent integration:", error)
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
    const manager = PersistentIntegrationManager.getInstance()

    await manager.updateIntegration(integrationId, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating persistent integration:", error)
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

    const manager = PersistentIntegrationManager.getInstance()
    await manager.removeIntegration(integrationId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing persistent integration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
