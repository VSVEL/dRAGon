"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, Calendar, Star } from "lucide-react"
import type { GitHubRepository } from "@/lib/github-api"

interface GitHubActivityProps {
  repositories: GitHubRepository[]
}

export function GitHubActivity({ repositories }: GitHubActivityProps) {
  // Sort repositories by last update
  const recentActivity = repositories
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)

  // Calculate activity metrics
  const thisWeek = new Date()
  thisWeek.setDate(thisWeek.getDate() - 7)

  const recentRepos = repositories.filter((repo) => new Date(repo.updatedAt) > thisWeek).length

  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazersCount, 0)
  const totalForks = repositories.reduce((sum, repo) => sum + repo.forksCount, 0)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div>
              <div className="text-2xl font-bold text-green-600">{recentRepos}</div>
              <div className="text-sm text-gray-600">Active This Week</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">{totalStars}</div>
              <div className="text-sm text-gray-600">Total Stars</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{totalForks}</div>
              <div className="text-sm text-gray-600">Total Forks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((repo) => (
            <div key={repo.id} className="flex items-center justify-between p-2 border rounded">
              <div className="flex-1">
                <div className="font-medium text-sm">{repo.name}</div>
                <div className="text-xs text-gray-600">Updated {new Date(repo.updatedAt).toLocaleDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                {repo.language && (
                  <Badge variant="outline" className="text-xs">
                    {repo.language}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Star className="h-3 w-3" />
                  {repo.stargazersCount}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
