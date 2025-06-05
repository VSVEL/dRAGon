import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GitHubAPIClient } from "@/lib/github-api"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, we'll use the session's access token
    // In a real implementation, we'd get a GitHub-specific token
    const githubToken = session.accessToken

    if (!githubToken) {
      return NextResponse.json({ error: "No GitHub access token available" }, { status: 401 })
    }

    const client = new GitHubAPIClient(githubToken)
    const stats = await client.fetchUserStats()

    return NextResponse.json({
      ...stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("GitHub stats API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch GitHub stats",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
