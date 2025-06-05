import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { IntegrationServiceV2 } from "@/lib/integration-service-v2"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const service = IntegrationServiceV2.getInstance()
    const userData = await service.restoreUserSession(session.user.email)

    return NextResponse.json({
      success: true,
      data: userData,
      message: userData.restored ? "Integrations restored successfully" : "No previous integrations found",
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
    const service = IntegrationServiceV2.getInstance()

    const integrationId = await service.saveIntegration(session.user.email, {
      ...integration,
      userId: session.user.email,
    })

    return NextResponse.json({
      success: true,
      integrationId,
      message: "Integration saved successfully",
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
    const service = IntegrationServiceV2.getInstance()

    await service.updateIntegration(integrationId, updates)

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

    const service = IntegrationServiceV2.getInstance()
    await service.deleteIntegration(integrationId)

    return NextResponse.json({
      success: true,
      message: "Integration removed successfully",
    })
  } catch (error) {
    console.error("Error removing integration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
