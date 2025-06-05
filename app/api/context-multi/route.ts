import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { MultiGoogleAuthManager } from "@/lib/multi-google-auth"
import { GoogleAPIClient } from "@/lib/google-api"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No session found" }, { status: 401 })
    }

    const authManager = MultiGoogleAuthManager.getInstance()
    await authManager.loadAccounts(session.user.email)

    const activeAccounts = authManager.getActiveAccounts()
    const contextData: Record<string, any> = {}

    // Fetch data from each active Google account
    for (const account of activeAccounts) {
      try {
        const client = new GoogleAPIClient(account.accessToken)

        // Fetch calendar events
        const calendarEvents = await client.fetchCalendarEvents()

        // Fetch emails
        const emails = await client.fetchEmails()

        contextData[`calendar_${account.email}`] = {
          account: {
            email: account.email,
            name: account.name,
            provider: "google",
            isPrimary: account.isPrimary,
          },
          data: calendarEvents,
          lastUsed: account.lastUsed,
        }

        contextData[`gmail_${account.email}`] = {
          account: {
            email: account.email,
            name: account.name,
            provider: "google",
            isPrimary: account.isPrimary,
          },
          data: emails,
          lastUsed: account.lastUsed,
        }

        // Update last used timestamp
        authManager.toggleAccount(account.email, true, session.user.email)
      } catch (error) {
        console.error(`Error fetching data for ${account.email}:`, error)
        contextData[`error_${account.email}`] = {
          account: {
            email: account.email,
            name: account.name,
            provider: "google",
            isPrimary: account.isPrimary,
          },
          error: error.message,
        }
      }
    }

    return NextResponse.json({
      data: contextData,
      accounts: activeAccounts.map((account) => ({
        email: account.email,
        name: account.name,
        isPrimary: account.isPrimary,
        isActive: account.isActive,
        lastUsed: account.lastUsed,
      })),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching multi-account context:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
