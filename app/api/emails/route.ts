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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const maxResults = Number.parseInt(searchParams.get("maxResults") || "20")
    const query = searchParams.get("query") || "in:inbox"
    const includeSpam = searchParams.get("includeSpam") === "true"
    const includeTrash = searchParams.get("includeTrash") === "true"

    console.log("Email API: Configuration:", { maxResults, query, includeSpam, includeTrash })

    const client = new GoogleAPIClient(session.accessToken)
    const emails = await client.fetchEmails(maxResults, query, includeSpam, includeTrash)

    console.log("Email API: Success, found", emails.length, "emails")

    return NextResponse.json({
      emails,
      count: emails.length,
      maxResults,
      query,
      quotaUsed: emails.length * 250, // Approximate quota units used
      timestamp: new Date().toISOString(),
    })
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
