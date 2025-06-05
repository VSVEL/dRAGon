import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const githubToken = process.env.GITHUB_TOKEN || session.githubAccessToken

    if (!githubToken) {
      return NextResponse.json(
        {
          error: "No GitHub access token available",
          message: "Please connect your GitHub account in the integrations page",
          needsConnection: true,
        },
        { status: 401 },
      )
    }

    const { searchParams } = new URL(request.url)
    const maxResults = Number.parseInt(searchParams.get("maxResults") || "20")

    // Return mock data for demo
    if (!githubToken || githubToken === "demo") {
      const mockPullRequests = [
        {
          id: 201,
          number: 45,
          title: "Implement user authentication system",
          body: "This PR adds a comprehensive user authentication system with JWT tokens and refresh token support.",
          state: "open",
          htmlUrl: "https://github.com/user/awesome-project/pull/45",
          user: {
            login: "user",
            avatarUrl: "https://github.com/identicons/user.png",
          },
          assignees: [],
          requestedReviewers: [
            {
              login: "reviewer1",
              avatarUrl: "https://github.com/identicons/reviewer1.png",
            },
          ],
          labels: [
            {
              name: "feature",
              color: "0e8a16",
            },
            {
              name: "backend",
              color: "1d76db",
            },
          ],
          milestone: {
            title: "v2.1.0",
            state: "open",
          },
          createdAt: "2023-11-28T10:30:00Z",
          updatedAt: "2023-11-30T14:20:00Z",
          closedAt: null,
          mergedAt: null,
          repository: {
            name: "awesome-project",
            fullName: "user/awesome-project",
          },
          draft: false,
          mergeable: true,
          mergeableState: "clean",
          merged: false,
          comments: 5,
          reviewComments: 3,
          commits: 8,
          additions: 245,
          deletions: 67,
          changedFiles: 12,
          head: {
            ref: "feature/auth-system",
            sha: "abc123def456",
          },
          base: {
            ref: "main",
            sha: "def456abc123",
          },
        },
        {
          id: 202,
          number: 32,
          title: "Add interactive charts to dashboard",
          body: "This PR adds interactive charts using D3.js for better data visualization.",
          state: "open",
          htmlUrl: "https://github.com/user/data-visualization/pull/32",
          user: {
            login: "user",
            avatarUrl: "https://github.com/identicons/user.png",
          },
          assignees: [
            {
              login: "user",
              avatarUrl: "https://github.com/identicons/user.png",
            },
          ],
          requestedReviewers: [],
          labels: [
            {
              name: "enhancement",
              color: "a2eeef",
            },
          ],
          milestone: null,
          createdAt: "2023-11-25T09:15:00Z",
          updatedAt: "2023-11-29T16:45:00Z",
          closedAt: null,
          mergedAt: null,
          repository: {
            name: "data-visualization",
            fullName: "user/data-visualization",
          },
          draft: true,
          mergeable: null,
          mergeableState: "unknown",
          merged: false,
          comments: 2,
          reviewComments: 1,
          commits: 4,
          additions: 156,
          deletions: 23,
          changedFiles: 6,
          head: {
            ref: "feature/interactive-charts",
            sha: "xyz789abc123",
          },
          base: {
            ref: "develop",
            sha: "abc123xyz789",
          },
        },
      ]

      return NextResponse.json({
        pullRequests: mockPullRequests.slice(0, maxResults),
        count: mockPullRequests.length,
        timestamp: new Date().toISOString(),
        demo: true,
      })
    }

    // If we have a real GitHub token, use the GitHub API
    const response = await fetch(
      `https://api.github.com/search/issues?q=type:pr+author:@me+state:open&sort=updated&per_page=${maxResults}`,
      {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "dRAGon-AI-Assistant",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    const pullRequests = data.items.map((pr: any) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      body: pr.body,
      state: pr.state,
      htmlUrl: pr.html_url,
      user: {
        login: pr.user.login,
        avatarUrl: pr.user.avatar_url,
      },
      assignees:
        pr.assignees?.map((assignee: any) => ({
          login: assignee.login,
          avatarUrl: assignee.avatar_url,
        })) || [],
      requestedReviewers:
        pr.requested_reviewers?.map((reviewer: any) => ({
          login: reviewer.login,
          avatarUrl: reviewer.avatar_url,
        })) || [],
      labels:
        pr.labels?.map((label: any) => ({
          name: label.name,
          color: label.color,
        })) || [],
      milestone: pr.milestone
        ? {
            title: pr.milestone.title,
            state: pr.milestone.state,
          }
        : null,
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      closedAt: pr.closed_at,
      mergedAt: pr.merged_at,
      repository: {
        name: pr.repository_url.split("/").pop(),
        fullName: pr.repository_url.split("/").slice(-2).join("/"),
      },
      draft: pr.draft || false,
      mergeable: pr.mergeable,
      mergeableState: pr.mergeable_state || "unknown",
      merged: pr.merged || false,
      comments: pr.comments || 0,
      reviewComments: pr.review_comments || 0,
      commits: pr.commits || 0,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      changedFiles: pr.changed_files || 0,
      head: {
        ref: pr.head?.ref || "",
        sha: pr.head?.sha || "",
      },
      base: {
        ref: pr.base?.ref || "",
        sha: pr.base?.sha || "",
      },
    }))

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
