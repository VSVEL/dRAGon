import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MultiAccountPluginManager } from "@/lib/plugins/multi-account-plugin-manager"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const pluginManager = new MultiAccountPluginManager(session.user.email)
    await pluginManager.initialize()

    const contextData = await pluginManager.fetchAllData()

    return NextResponse.json({
      data: contextData,
      accounts: pluginManager
        .getAccountManager()
        .getAllAccounts()
        .map((account) => ({
          id: account.id,
          provider: account.provider,
          email: account.accountEmail,
          name: account.accountName,
          isActive: account.isActive,
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
