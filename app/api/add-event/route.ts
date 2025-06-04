import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleAPIClient } from "@/lib/google-api"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventData = await request.json()
    const client = new GoogleAPIClient(session.accessToken)
    const event = await client.createCalendarEvent(eventData)

    if (!event) {
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Add event API error:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
