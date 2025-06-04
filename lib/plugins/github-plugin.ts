import { BasePlugin } from "./base-plugin"
import { GitHubAPIClient } from "../github-api"
import type { GitHubRepository, GitHubIssue, GitHubPullRequest, GitHubNotification } from "../github-api"

export interface GitHubData {
  repositories: GitHubRepository[]
  issues: GitHubIssue[]
  pullRequests: GitHubPullRequest[]
  notifications: GitHubNotification[]
}

export class GitHubPlugin extends BasePlugin {
  id = "github"
  name = "GitHub"
  scopes = ["repo", "notifications", "user:email"]

  isEnabled(): boolean {
    return true
  }

  async fetchData(accessToken: string): Promise<GitHubData> {
    const client = new GitHubAPIClient(accessToken)

    const [repositories, issues, pullRequests, notifications] = await Promise.all([
      client.fetchRepositories(10),
      client.fetchIssues(10),
      client.fetchPullRequests(10),
      client.fetchNotifications(10),
    ])

    return {
      repositories,
      issues,
      pullRequests,
      notifications,
    }
  }

  formatForAI(data: GitHubData): string {
    const { repositories, issues, pullRequests, notifications } = data

    const sections: string[] = []

    if (repositories.length > 0) {
      sections.push(`Recent Repositories (${repositories.length} items):
${repositories
  .map(
    (repo) =>
      `- ${repo.fullName}
  Description: ${repo.description || "No description"}
  Language: ${repo.language || "Unknown"}
  Stars: ${repo.stargazersCount}, Forks: ${repo.forksCount}
  Open Issues: ${repo.openIssuesCount}
  Last Updated: ${new Date(repo.updatedAt).toLocaleDateString()}`,
  )
  .join("\n\n")}`)
    }

    if (issues.length > 0) {
      sections.push(`Assigned Issues (${issues.length} items):
${issues
  .map(
    (issue) =>
      `- #${issue.number}: ${issue.title}
  Repository: ${issue.repository.fullName}
  State: ${issue.state}
  Labels: ${issue.labels.map((l) => l.name).join(", ") || "None"}
  Created: ${new Date(issue.createdAt).toLocaleDateString()}`,
  )
  .join("\n\n")}`)
    }

    if (pullRequests.length > 0) {
      sections.push(`Open Pull Requests (${pullRequests.length} items):
${pullRequests
  .map(
    (pr) =>
      `- #${pr.number}: ${pr.title}
  Repository: ${pr.repository.fullName}
  State: ${pr.state}${pr.draft ? " (Draft)" : ""}
  Created: ${new Date(pr.createdAt).toLocaleDateString()}`,
  )
  .join("\n\n")}`)
    }

    if (notifications.length > 0) {
      sections.push(`Unread Notifications (${notifications.filter((n) => n.unread).length} items):
${notifications
  .filter((n) => n.unread)
  .map(
    (notification) =>
      `- ${notification.subject.title}
  Repository: ${notification.repository.fullName}
  Type: ${notification.subject.type}
  Reason: ${notification.reason}`,
  )
  .join("\n\n")}`)
    }

    return sections.length > 0 ? sections.join("\n\n---\n\n") : "No GitHub activity found."
  }
}
