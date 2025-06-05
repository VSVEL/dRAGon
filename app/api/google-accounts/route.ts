import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MultiGoogleAuthManager } from "@/lib/multi-google-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const authManager = MultiGoogleAuthManager.getInstance()
    await authManager.loadAccounts(session.user.email)

    // Add the primary account (from session) if not already present
    const primaryAccount = {
      id: "primary",
      email: session.user.email,
      name: session.user.name || "Primary Account",
      picture: session.user.image,
      accessToken: session.accessToken || "",
      refreshToken: session.refreshToken,
      isActive: true,
      isPrimary: true,
      connectedAt: new Date(),
    }

    // Check if primary account is already in the list
    const existingPrimary = authManager.getAccount(session.user.email)
    if (!existingPrimary) {
      authManager.addAccount(primaryAccount, session.user.email)
    }

    const accounts = authManager.getAllAccounts()

    return NextResponse.json({
      accounts,
      primary: session.user.email,
      total: accounts.length,
    })
  } catch (error) {
    console.error("Error fetching Google accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action, email } = await request.json()
    const authManager = MultiGoogleAuthManager.getInstance()
    await authManager.loadAccounts(session.user.email)

    switch (action) {
      case "toggle":
        const { isActive } = await request.json()
        authManager.toggleAccount(email, isActive, session.user.email)
        break

      case "remove":
        if (email === session.user.email) {
          return NextResponse.json({ error: "Cannot remove primary account" }, { status: 400 })
        }
        authManager.removeAccount(email, session.user.email)
        break

      case "set_primary":
        authManager.setPrimaryAccount(email, session.user.email)
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error managing Google accounts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
