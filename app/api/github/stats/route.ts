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

    // Return mock data for demo
    if (!githubToken || githubToken === "demo") {
      const mockStats = {
        profile: {
          login: "demo-user",
          name: "Demo User",
          bio: "Full-stack developer passionate about open source",
          company: "Tech Company",
          location: "San Francisco, CA",
          email: "demo@example.com",
          hireable: true,
          publicRepos: 15,
          publicGists: 8,
          followers: 42,
          following: 28,
          createdAt: "2020-01-15T09:00:00Z",
          updatedAt: "2023-11-30T14:20:00Z",
          avatarUrl: "https://github.com/identicons/demo-user.png",
          htmlUrl: "https://github.com/demo-user",
        },
        totalRepos: 15,
        publicRepos: 12,
        privateRepos: 3,
        totalStars: 135,
        totalForks: 37,
        followers: 42,
        following: 28,
        languages: {
          TypeScript: 8,
          JavaScript: 6,
          Python: 4,
          Go: 3,
          Dart: 2,
          Rust: 1,
          Java: 1,
        },
        recentActivity: [
          {
            type: "push",
            repo: "awesome-project",
            date: "2023-11-30T16:45:00Z",
            commits: 3,
          },
          {
            type: "pr_opened",
            repo: "data-visualization",
            date: "2023-11-28T10:30:00Z",
            title: "Add interactive charts",
          },
          {
            type: "issue_closed",
            repo: "mobile-app",
            date: "2023-11-25T14:20:00Z",
            title: "Fix navigation bug",
          },
        ],
      }

      return NextResponse.json({
        ...mockStats,
        timestamp: new Date().toISOString(),
        demo: true,
      })
    }

    // If we have a real GitHub token, use the GitHub API
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "dRAGon-AI-Assistant",
      },
    })

    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status} ${userResponse.statusText}`)
    }

    const profile = await userResponse.json()

    const reposResponse = await fetch("https://api.github.com/user/repos?per_page=100", {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "dRAGon-AI-Assistant",
      },
    })

    const repos = reposResponse.ok ? await reposResponse.json() : []

    const totalStars = repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0)
    const totalForks = repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0)
    const publicRepos = repos.filter((repo: any) => !repo.private).length
    const privateRepos = repos.filter((repo: any) => repo.private).length

    // Calculate language distribution
    const languages: { [key: string]: number } = {}
    repos.forEach((repo: any) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    })

    return NextResponse.json({
      profile,
      totalRepos: repos.length,
      publicRepos,
      privateRepos,
      totalStars,
      totalForks,
      followers: profile.followers,
      following: profile.following,
      languages,
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
