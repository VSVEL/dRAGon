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
  createdAt: string
  pushedAt: string
  size: number
  defaultBranch: string
  topics: string[]
  hasIssues: boolean
  hasProjects: boolean
  hasWiki: boolean
  archived: boolean
  disabled: boolean
  visibility: "public" | "private"
  owner: {
    login: string
    avatarUrl: string
    type: "User" | "Organization"
  }
  license?: {
    key: string
    name: string
    spdxId: string
  }
  collaborators?: number
  networkCount: number
  subscribersCount: number
}

export interface GitHubCommit {
  sha: string
  message: string
  author: {
    name: string
    email: string
    date: string
  }
  committer: {
    name: string
    email: string
    date: string
  }
  url: string
  htmlUrl: string
  stats?: {
    additions: number
    deletions: number
    total: number
  }
  files?: Array<{
    filename: string
    status: "added" | "removed" | "modified" | "renamed"
    additions: number
    deletions: number
    changes: number
  }>
}

export interface GitHubBranch {
  name: string
  commit: {
    sha: string
    url: string
  }
  protected: boolean
}

export interface GitHubRelease {
  id: number
  tagName: string
  name: string
  body: string
  draft: boolean
  prerelease: boolean
  createdAt: string
  publishedAt: string
  htmlUrl: string
  tarballUrl: string
  zipballUrl: string
  author: {
    login: string
    avatarUrl: string
  }
}

export interface GitHubWorkflowRun {
  id: number
  name: string
  headBranch: string
  headSha: string
  status: "queued" | "in_progress" | "completed"
  conclusion?: "success" | "failure" | "neutral" | "cancelled" | "skipped" | "timed_out" | "action_required"
  workflowId: number
  url: string
  htmlUrl: string
  createdAt: string
  updatedAt: string
  runStartedAt: string
  event: string
  actor: {
    login: string
    avatarUrl: string
  }
}

export interface GitHubCodeFrequency {
  week: number
  additions: number
  deletions: number
}

export interface GitHubContributor {
  login: string
  id: number
  avatarUrl: string
  contributions: number
  type: "User" | "Bot"
}

export interface GitHubLanguageStats {
  [language: string]: number
}

export interface GitHubIssue {
  id: number
  number: number
  title: string
  body?: string
  state: "open" | "closed"
  stateReason?: "completed" | "not_planned" | "reopened"
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
    description?: string
  }>
  milestone?: {
    title: string
    description?: string
    state: "open" | "closed"
    dueOn?: string
  }
  createdAt: string
  updatedAt: string
  closedAt?: string
  repository: {
    name: string
    fullName: string
  }
  comments: number
  reactions: {
    totalCount: number
    "+1": number
    "-1": number
    laugh: number
    hooray: number
    confused: number
    heart: number
    rocket: number
    eyes: number
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
  requestedReviewers: Array<{
    login: string
    avatarUrl: string
  }>
  labels: Array<{
    name: string
    color: string
  }>
  milestone?: {
    title: string
    state: "open" | "closed"
  }
  createdAt: string
  updatedAt: string
  closedAt?: string
  mergedAt?: string
  repository: {
    name: string
    fullName: string
  }
  draft: boolean
  mergeable?: boolean
  mergeableState: "clean" | "dirty" | "unstable" | "blocked" | "behind" | "unknown"
  merged: boolean
  comments: number
  reviewComments: number
  commits: number
  additions: number
  deletions: number
  changedFiles: number
  head: {
    ref: string
    sha: string
  }
  base: {
    ref: string
    sha: string
  }
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
      const data = await this.request(`/user/repos?sort=updated&per_page=${maxResults}&affiliation=owner,collaborator`)

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
          : undefined,
        collaborators: repo.collaborators_count,
        networkCount: repo.network_count,
        subscribersCount: repo.subscribers_count,
      }))
    } catch (error) {
      console.error("Error fetching GitHub repositories:", error)
      return []
    }
  }

  async fetchRecentCommits(repo: string, maxResults = 10): Promise<GitHubCommit[]> {
    try {
      const data = await this.request(`/repos/${repo}/commits?per_page=${maxResults}`)

      return data.map((commit: any) => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: {
          name: commit.commit.author.name,
          email: commit.commit.author.email,
          date: commit.commit.author.date,
        },
        committer: {
          name: commit.commit.committer.name,
          email: commit.commit.committer.email,
          date: commit.commit.committer.date,
        },
        url: commit.url,
        htmlUrl: commit.html_url,
        stats: commit.stats,
        files: commit.files,
      }))
    } catch (error) {
      console.error("Error fetching commits:", error)
      return []
    }
  }

  async fetchWorkflowRuns(repo: string, maxResults = 10): Promise<GitHubWorkflowRun[]> {
    try {
      const data = await this.request(`/repos/${repo}/actions/runs?per_page=${maxResults}`)

      return data.workflow_runs.map((run: any) => ({
        id: run.id,
        name: run.name,
        headBranch: run.head_branch,
        headSha: run.head_sha,
        status: run.status,
        conclusion: run.conclusion,
        workflowId: run.workflow_id,
        url: run.url,
        htmlUrl: run.html_url,
        createdAt: run.created_at,
        updatedAt: run.updated_at,
        runStartedAt: run.run_started_at,
        event: run.event,
        actor: {
          login: run.actor.login,
          avatarUrl: run.actor.avatar_url,
        },
      }))
    } catch (error) {
      console.error("Error fetching workflow runs:", error)
      return []
    }
  }

  async fetchLanguageStats(repo: string): Promise<GitHubLanguageStats> {
    try {
      return await this.request(`/repos/${repo}/languages`)
    } catch (error) {
      console.error("Error fetching language stats:", error)
      return {}
    }
  }

  async fetchContributors(repo: string): Promise<GitHubContributor[]> {
    try {
      const data = await this.request(`/repos/${repo}/contributors?per_page=10`)

      return data.map((contributor: any) => ({
        login: contributor.login,
        id: contributor.id,
        avatarUrl: contributor.avatar_url,
        contributions: contributor.contributions,
        type: contributor.type,
      }))
    } catch (error) {
      console.error("Error fetching contributors:", error)
      return []
    }
  }

  async fetchReleases(repo: string, maxResults = 5): Promise<GitHubRelease[]> {
    try {
      const data = await this.request(`/repos/${repo}/releases?per_page=${maxResults}`)

      return data.map((release: any) => ({
        id: release.id,
        tagName: release.tag_name,
        name: release.name,
        body: release.body,
        draft: release.draft,
        prerelease: release.prerelease,
        createdAt: release.created_at,
        publishedAt: release.published_at,
        htmlUrl: release.html_url,
        tarballUrl: release.tarball_url,
        zipballUrl: release.zipball_url,
        author: {
          login: release.author.login,
          avatarUrl: release.author.avatar_url,
        },
      }))
    } catch (error) {
      console.error("Error fetching releases:", error)
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
          : undefined,
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
          : undefined,
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
    } catch (error) {
      console.error("Error fetching GitHub pull requests:", error)
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

  async fetchUserStats() {
    try {
      const profile = await this.fetchUserProfile()
      if (!profile) return null

      const [repos, followers, following] = await Promise.all([
        this.request("/user/repos?per_page=100"),
        this.request("/user/followers?per_page=1"),
        this.request("/user/following?per_page=1"),
      ])

      return {
        profile,
        totalRepos: repos.length,
        publicRepos: repos.filter((repo: any) => !repo.private).length,
        privateRepos: repos.filter((repo: any) => repo.private).length,
        totalStars: repos.reduce((sum: number, repo: any) => sum + repo.stargazers_count, 0),
        totalForks: repos.reduce((sum: number, repo: any) => sum + repo.forks_count, 0),
        followers: profile.followers,
        following: profile.following,
        languages: this.getTopLanguages(repos),
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      return null
    }
  }

  private getTopLanguages(repos: any[]): { [key: string]: number } {
    const languages: { [key: string]: number } = {}
    repos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    })
    return languages
  }
}
