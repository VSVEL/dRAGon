import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PluginManager } from "@/lib/plugins/plugin-manager"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    if (!session.accessToken) {
      return NextResponse.json({ error: "No access token available" }, { status: 401 })
    }

    const pluginManager = new PluginManager()
    const contextData = await pluginManager.fetchAllData(session.accessToken)

    return NextResponse.json(contextData)
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
