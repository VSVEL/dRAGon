export interface GitHubRepository {
  id: number
  name: string
  fullName: string
  description?: string
  private: boolean
  htmlUrl: string
  language?: string
  stargazersCount: number
  forksCount: number
  openIssuesCount: number
  updatedAt: string
  owner: {
    login: string
    avatarUrl: string
  }
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body?: string
  state: "open" | "closed"
  htmlUrl: string
  user: {
    login: string
    avatarUrl: string
  }
  assignees: Array<{
    login: string
    avatarUrl: string
  }>
  labels: Array<{
    name: string
    color: string
  }>
  createdAt: string
  updatedAt: string
  repository: {
    name: string
    fullName: string
  }
}

export interface GitHubPullRequest {
  id: number
  number: number
  title: string
  body?: string
  state: "open" | "closed" | "merged"
  htmlUrl: string
  user: {
    login: string
    avatarUrl: string
  }
  assignees: Array<{
    login: string
    avatarUrl: string
  }>
  reviewers: Array<{
    login: string
    avatarUrl: string
  }>
  createdAt: string
  updatedAt: string
  repository: {
    name: string
    fullName: string
  }
  draft: boolean
  mergeable?: boolean
}

export interface GitHubNotification {
  id: string
  subject: {
    title: string
    type: "Issue" | "PullRequest" | "Release" | "Discussion"
    url: string
  }
  repository: {
    name: string
    fullName: string
    htmlUrl: string
  }
  reason: string
  unread: boolean
  updatedAt: string
  htmlUrl: string
}

export class GitHubAPIClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.github.com${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "dRAGon-AI-Assistant",
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async fetchRepositories(maxResults = 20): Promise<GitHubRepository[]> {
    try {
      const data = await this.request(`/user/repos?sort=updated&per_page=${maxResults}`)

      return data.map((repo: any) => ({
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
        owner: {
          login: repo.owner.login,
          avatarUrl: repo.owner.avatar_url,
        },
      }))
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error)
      return []
    }
  }

  async fetchIssues(maxResults = 20): Promise<GitHubIssue[]> {
    try {
      const data = await this.request(`/issues?filter=assigned&state=open&sort=updated&per_page=${maxResults}`)

      return data.map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        body: issue.body,
        state: issue.state,
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
        })),
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        repository: {
          name: issue.repository.name,
          fullName: issue.repository.full_name,
        },
      }))
    } catch (error) {
      console.error("Error fetching GitHub issues:", error)
      return []
    }
  }

  async fetchPullRequests(maxResults = 20): Promise<GitHubPullRequest[]> {
    try {
      const data = await this.request(
        `/search/issues?q=type:pr+author:@me+state:open&sort=updated&per_page=${maxResults}`,
      )

      return data.items.map((pr: any) => ({
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
        reviewers: [], // Would need additional API call to get reviewers
        createdAt: pr.created_at,
        updatedAt: pr.updated_at,
        repository: {
          name: pr.repository_url.split("/").pop(),
          fullName: pr.repository_url.split("/").slice(-2).join("/"),
        },
        draft: pr.draft || false,
        mergeable: pr.mergeable,
      }))
    } catch (error) {
      console.error("Error fetching GitHub pull requests:", error)
      return []
    }
  }

  async fetchNotifications(maxResults = 20): Promise<GitHubNotification[]> {
    try {
      const data = await this.request(`/notifications?all=false&per_page=${maxResults}`)

      return data.map((notification: any) => ({
        id: notification.id,
        subject: {
          title: notification.subject.title,
          type: notification.subject.type,
          url: notification.subject.url,
        },
        repository: {
          name: notification.repository.name,
          fullName: notification.repository.full_name,
          htmlUrl: notification.repository.html_url,
        },
        reason: notification.reason,
        unread: notification.unread,
        updatedAt: notification.updated_at,
        htmlUrl:
          notification.subject.url
            ?.replace("api.github.com/repos", "github.com")
            .replace("/pulls/", "/pull/")
            .replace("/issues/", "/issue/") || notification.repository.html_url,
      }))
    } catch (error) {
      console.error("Error fetching GitHub notifications:", error)
      return []
    }
  }

  async fetchUserProfile() {
    try {
      return await this.request("/user")
    } catch (error) {
      console.error("Error fetching GitHub user profile:", error)
      return null
    }
  }
}
