import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleAPIClient } from "@/lib/google-api"

export async function GET(request: NextRequest) {
  try {
    console.log("Calendar API: Starting request")

    const session = await getServerSession(authOptions)
    console.log("Calendar API: Session status:", !!session)

    if (!session?.accessToken) {
      console.log("Calendar API: No access token")
      return NextResponse.json({ error: "Unauthorized", details: "No access token" }, { status: 401 })
    }

    console.log("Calendar API: Creating Google API client")
    const client = new GoogleAPIClient(session.accessToken)

    console.log("Calendar API: Fetching events")
    const events = await client.fetchCalendarEvents()

    console.log("Calendar API: Success, found", events.length, "events")
    return NextResponse.json({ events, count: events.length })
  } catch (error) {
    console.error("Calendar API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch calendar events",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
