import { Star, GitFork, AlertCircle, ExternalLink, GitPullRequest } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { GitHubRepository, GitHubIssue, GitHubPullRequest } from "@/lib/github-api"

interface GitHubRepoCardProps {
  repo: GitHubRepository
  compact?: boolean
}

export function GitHubRepoCard({ repo, compact = false }: GitHubRepoCardProps) {
  if (compact) {
    return (
      <Card className="p-3 bg-gray-50 border-gray-200">
        <div className="space-y-1">
          <div className="font-medium text-sm truncate">{repo.name}</div>
          <div className="text-xs text-gray-600 truncate">{repo.description}</div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            {repo.language && <span>{repo.language}</span>}
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {repo.stargazersCount}
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="h-3 w-3" />
              {repo.forksCount}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold">{repo.fullName}</h3>
              {repo.description && <p className="text-sm text-gray-600 mt-1">{repo.description}</p>}
            </div>
            {repo.private && <Badge variant="secondary">Private</Badge>}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            {repo.language && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>{repo.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{repo.stargazersCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              <span>{repo.forksCount}</span>
            </div>
            {repo.openIssuesCount > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                <span>{repo.openIssuesCount} issues</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={repo.htmlUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Repository
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface GitHubIssueCardProps {
  issue: GitHubIssue
  compact?: boolean
}

export function GitHubIssueCard({ issue, compact = false }: GitHubIssueCardProps) {
  if (compact) {
    return (
      <Card className="p-3 bg-yellow-50 border-yellow-200">
        <div className="space-y-1">
          <div className="font-medium text-sm truncate">
            #{issue.number}: {issue.title}
          </div>
          <div className="text-xs text-gray-600">{issue.repository.fullName}</div>
          <div className="flex items-center gap-1">
            {issue.labels.slice(0, 2).map((label) => (
              <Badge key={label.name} variant="outline" className="text-xs">
                {label.name}
              </Badge>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">
              #{issue.number}: {issue.title}
            </h3>
            <p className="text-sm text-gray-600">{issue.repository.fullName}</p>
          </div>

          {issue.labels.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {issue.labels.map((label) => (
                <Badge key={label.name} variant="outline" className="text-xs">
                  {label.name}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={issue.htmlUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Issue
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface GitHubPRCardProps {
  pr: GitHubPullRequest
  compact?: boolean
}

export function GitHubPRCard({ pr, compact = false }: GitHubPRCardProps) {
  if (compact) {
    return (
      <Card className="p-3 bg-green-50 border-green-200">
        <div className="space-y-1">
          <div className="font-medium text-sm truncate">
            #{pr.number}: {pr.title}
          </div>
          <div className="text-xs text-gray-600">{pr.repository.fullName}</div>
          <div className="flex items-center gap-2">
            <Badge variant={pr.state === "open" ? "default" : "secondary"} className="text-xs">
              {pr.state}
            </Badge>
            {pr.draft && (
              <Badge variant="outline" className="text-xs">
                Draft
              </Badge>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">
              #{pr.number}: {pr.title}
            </h3>
            <p className="text-sm text-gray-600">{pr.repository.fullName}</p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={pr.state === "open" ? "default" : "secondary"}>{pr.state}</Badge>
            {pr.draft && <Badge variant="outline">Draft</Badge>}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={pr.htmlUrl} target="_blank" rel="noopener noreferrer">
                <GitPullRequest className="h-4 w-4 mr-2" />
                View Pull Request
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
