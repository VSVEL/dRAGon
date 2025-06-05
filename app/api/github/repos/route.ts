import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if we have a GitHub token
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

    // For demo purposes, return mock data if no real token
    if (!githubToken || githubToken === "demo") {
      const mockRepositories = [
        {
          id: 1,
          name: "awesome-project",
          fullName: "user/awesome-project",
          description: "An awesome project built with Next.js and TypeScript",
          private: false,
          htmlUrl: "https://github.com/user/awesome-project",
          language: "TypeScript",
          stargazersCount: 42,
          forksCount: 12,
          openIssuesCount: 3,
          updatedAt: "2023-12-01T10:30:00Z",
          createdAt: "2023-01-15T09:00:00Z",
          pushedAt: "2023-12-01T10:30:00Z",
          size: 1024,
          defaultBranch: "main",
          topics: ["nextjs", "typescript", "react"],
          hasIssues: true,
          hasProjects: true,
          hasWiki: false,
          archived: false,
          disabled: false,
          visibility: "public",
          owner: {
            login: "user",
            avatarUrl: "https://github.com/identicons/user.png",
            type: "User",
          },
          license: {
            key: "mit",
            name: "MIT License",
            spdxId: "MIT",
          },
          collaborators: 3,
          networkCount: 12,
          subscribersCount: 8,
        },
        {
          id: 2,
          name: "data-visualization",
          fullName: "user/data-visualization",
          description: "Interactive data visualization dashboard",
          private: false,
          htmlUrl: "https://github.com/user/data-visualization",
          language: "JavaScript",
          stargazersCount: 28,
          forksCount: 7,
          openIssuesCount: 1,
          updatedAt: "2023-11-28T14:20:00Z",
          createdAt: "2023-03-10T11:15:00Z",
          pushedAt: "2023-11-28T14:20:00Z",
          size: 2048,
          defaultBranch: "main",
          topics: ["d3js", "visualization", "dashboard"],
          hasIssues: true,
          hasProjects: false,
          hasWiki: true,
          archived: false,
          disabled: false,
          visibility: "public",
          owner: {
            login: "user",
            avatarUrl: "https://github.com/identicons/user.png",
            type: "User",
          },
          license: {
            key: "apache-2.0",
            name: "Apache License 2.0",
            spdxId: "Apache-2.0",
          },
          collaborators: 2,
          networkCount: 7,
          subscribersCount: 5,
        },
        {
          id: 3,
          name: "mobile-app",
          fullName: "user/mobile-app",
          description: "Cross-platform mobile application",
          private: true,
          htmlUrl: "https://github.com/user/mobile-app",
          language: "Dart",
          stargazersCount: 15,
          forksCount: 3,
          openIssuesCount: 5,
          updatedAt: "2023-11-30T16:45:00Z",
          createdAt: "2023-06-20T08:30:00Z",
          pushedAt: "2023-11-30T16:45:00Z",
          size: 3072,
          defaultBranch: "develop",
          topics: ["flutter", "mobile", "cross-platform"],
          hasIssues: true,
          hasProjects: true,
          hasWiki: false,
          archived: false,
          disabled: false,
          visibility: "private",
          owner: {
            login: "user",
            avatarUrl: "https://github.com/identicons/user.png",
            type: "User",
          },
          license: null,
          collaborators: 4,
          networkCount: 3,
          subscribersCount: 2,
        },
      ]

      return NextResponse.json({
        repositories: mockRepositories.slice(0, maxResults),
        count: mockRepositories.length,
        timestamp: new Date().toISOString(),
        demo: true,
      })
    }

    // If we have a real GitHub token, use the GitHub API
    const response = await fetch(
      `https://api.github.com/user/repos?sort=updated&per_page=${maxResults}&affiliation=owner,collaborator`,
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

    const repositories = data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      private: repo.private,
      htmlUrl: repo.html_url,
      language: repo.language,
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
      openIssuesCount: repo.open_issues_count,
      updatedAt: repo.updated_at,
      createdAt: repo.created_at,
      pushedAt: repo.pushed_at,
      size: repo.size,
      defaultBranch: repo.default_branch,
      topics: repo.topics || [],
      hasIssues: repo.has_issues,
      hasProjects: repo.has_projects,
      hasWiki: repo.has_wiki,
      archived: repo.archived,
      disabled: repo.disabled,
      visibility: repo.visibility,
      owner: {
        login: repo.owner.login,
        avatarUrl: repo.owner.avatar_url,
        type: repo.owner.type,
      },
      license: repo.license
        ? {
            key: repo.license.key,
            name: repo.license.name,
            spdxId: repo.license.spdx_id,
          }
        : null,
      collaborators: repo.collaborators_count,
      networkCount: repo.network_count,
      subscribersCount: repo.subscribers_count,
    }))

    return NextResponse.json({
      repositories,
      count: repositories.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("GitHub repos API error:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch GitHub repositories",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
