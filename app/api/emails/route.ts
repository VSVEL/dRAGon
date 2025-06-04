import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleAPIClient } from "@/lib/google-api"

export async function GET(request: NextRequest) {
  try {
    console.log("Email API: Starting request")

    const session = await getServerSession(authOptions)
    console.log("Email API: Session status:", !!session)

    if (!session?.accessToken) {
      console.log("Email API: No access token")
      return NextResponse.json({ error: "Unauthorized", details: "No access token" }, { status: 401 })
    }

    console.log("Email API: Creating Google API client")
    const client = new GoogleAPIClient(session.accessToken)

    console.log("Email API: Fetching emails")
    const emails = await client.fetchEmails()

    console.log("Email API: Success, found", emails.length, "emails")
    return NextResponse.json({ emails, count: emails.length })
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch emails",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
