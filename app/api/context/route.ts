import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PluginManager } from "@/lib/plugins/plugin-manager"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const pluginManager = new PluginManager()
    const contextData = await pluginManager.fetchAllData(session.accessToken as string)

    return NextResponse.json(contextData)
  } catch (error) {
    console.error("Error fetching context:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
