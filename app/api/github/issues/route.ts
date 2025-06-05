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
      const mockIssues = [
        {
          id: 101,
          number: 42,
          title: "Fix authentication bug in login flow",
          body: "Users are experiencing issues with the login flow when using social authentication.",
          state: "open",
          stateReason: null,
          htmlUrl: "https://github.com/user/awesome-project/issues/42",
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
          labels: [
            {
              name: "bug",
              color: "d73a4a",
              description: "Something isn't working",
            },
            {
              name: "high-priority",
              color: "b60205",
              description: "High priority issue",
            },
          ],
          milestone: {
            title: "v2.1.0",
            description: "Next minor release",
            state: "open",
            dueOn: "2023-12-15T00:00:00Z",
          },
          createdAt: "2023-11-25T10:30:00Z",
          updatedAt: "2023-11-30T14:20:00Z",
          closedAt: null,
          repository: {
            name: "awesome-project",
            fullName: "user/awesome-project",
          },
          comments: 3,
          reactions: {
            totalCount: 5,
            "+1": 3,
            "-1": 0,
            laugh: 0,
            hooray: 1,
            confused: 0,
            heart: 1,
            rocket: 0,
            eyes: 0,
          },
        },
        {
          id: 102,
          number: 28,
          title: "Add dark mode support to dashboard",
          body: "Implement dark mode theme for better user experience during night time usage.",
          state: "open",
          stateReason: null,
          htmlUrl: "https://github.com/user/data-visualization/issues/28",
          user: {
            login: "contributor",
            avatarUrl: "https://github.com/identicons/contributor.png",
          },
          assignees: [
            {
              login: "user",
              avatarUrl: "https://github.com/identicons/user.png",
            },
          ],
          labels: [
            {
              name: "enhancement",
              color: "a2eeef",
              description: "New feature or request",
            },
            {
              name: "ui",
              color: "1d76db",
              description: "User interface related",
            },
          ],
          milestone: null,
          createdAt: "2023-11-20T09:15:00Z",
          updatedAt: "2023-11-28T16:45:00Z",
          closedAt: null,
          repository: {
            name: "data-visualization",
            fullName: "user/data-visualization",
          },
          comments: 2,
          reactions: {
            totalCount: 8,
            "+1": 6,
            "-1": 0,
            laugh: 0,
            hooray: 2,
            confused: 0,
            heart: 0,
            rocket: 0,
            eyes: 0,
          },
        },
      ]

      return NextResponse.json({
        issues: mockIssues.slice(0, maxResults),
        count: mockIssues.length,
        timestamp: new Date().toISOString(),
        demo: true,
      })
    }

    // If we have a real GitHub token, use the GitHub API
    const response = await fetch(
      `https://api.github.com/issues?filter=assigned&state=open&sort=updated&per_page=${maxResults}`,
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

    const issues = data.map((issue: any) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body,
      state: issue.state,
      stateReason: issue.state_reason,
      htmlUrl: issue.html_url,
      user: {
        login: issue.user.login,
        avatarUrl: issue.user.avatar_url,
      },
      assignees: issue.assignees.map((assignee: any) => ({
        login: assignee.login,
        avatarUrl: assignee.avatar_url,
      })),
      labels: issue.labels.map((label: any) => ({
        name: label.name,
        color: label.color,
        description: label.description,
      })),
      milestone: issue.milestone
        ? {
            title: issue.milestone.title,
            description: issue.milestone.description,
            state: issue.milestone.state,
            dueOn: issue.milestone.due_on,
          }
        : null,
      createdAt: issue.created_at,
      updatedAt: issue.updated_at,
      closedAt: issue.closed_at,
      repository: {
        name: issue.repository.name,
        fullName: issue.repository.full_name,
      },
      comments: issue.comments,
      reactions: {
        totalCount: issue.reactions.total_count,
        "+1": issue.reactions["+1"],
        "-1": issue.reactions["-1"],
        laugh: issue.reactions.laugh,
        hooray: issue.reactions.hooray,
        confused: issue.reactions.confused,
        heart: issue.reactions.heart,
        rocket: issue.reactions.rocket,
        eyes: issue.reactions.eyes,
      },
    }))

    return NextResponse.json({
      issues,
      count: issues.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("GitHub issues API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch GitHub issues",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
