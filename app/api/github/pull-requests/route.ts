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

    const githubToken = session.accessToken // This would be GitHub token in real implementation

    if (!githubToken) {
      return NextResponse.json({ error: "No GitHub access token available" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const maxResults = Number.parseInt(searchParams.get("maxResults") || "20")

    const client = new GitHubAPIClient(githubToken)
    const pullRequests = await client.fetchPullRequests(maxResults)

    return NextResponse.json({
      pullRequests,
      count: pullRequests.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("GitHub pull requests API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch GitHub pull requests",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
