"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GitHubRepoCard, GitHubIssueCard, GitHubPRCard } from "@/components/github-card"
import { GitHubStats } from "@/components/github-stats"
import { GitHubActivity } from "@/components/github-activity"
import { Github, GitBranch, Star, GitFork, AlertCircle, GitPullRequest, Users, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { GitHubRepository, GitHubIssue, GitHubPullRequest } from "@/lib/github-api"

export default function GitHubDashboard() {
  const { data: session } = useSession()
  const [repositories, setRepositories] = useState<GitHubRepository[]>([])
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [pullRequests, setPullRequests] = useState<GitHubPullRequest[]>([])
  const [userStats, setUserStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    if (session) {
      fetchGitHubData()
    }
  }, [session])

  const fetchGitHubData = async () => {
    try {
      setIsLoading(true)

      const [reposResponse, issuesResponse, prsResponse] = await Promise.all([
        fetch("/api/github/repos?maxResults=20"),
        fetch("/api/github/issues?maxResults=20"),
        fetch("/api/github/pull-requests?maxResults=20"),
      ])

      if (reposResponse.ok) {
        const reposData = await reposResponse.json()
        setRepositories(reposData.repositories || [])
      }

      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json()
        setIssues(issuesData.issues || [])
      }

      if (prsResponse.ok) {
        const prsData = await prsResponse.json()
        setPullRequests(prsData.pullRequests || [])
      }

      // Fetch user stats
      const statsResponse = await fetch("/api/github/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setUserStats(statsData)
      }

      setLastRefresh(new Date())
    } catch (error) {
      console.error("Error fetching GitHub data:", error)
      toast({
        title: "Error",
        description: "Failed to fetch GitHub data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchGitHubData()
    toast({
      title: "Refreshing",
      description: "Fetching latest GitHub data...",
    })
  }

  if (!session) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Github className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">GitHub Dashboard</h2>
            <p className="text-gray-600 mb-4">Please sign in to view your GitHub dashboard</p>
            <Button>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Github className="h-8 w-8" />
            GitHub Dashboard
          </h1>
          <p className="text-gray-600">Overview of your GitHub activity and repositories</p>
          <p className="text-sm text-gray-500">Last updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>
        <Button onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Repositories</p>
                  <p className="text-2xl font-bold">{userStats.totalRepos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Stars</p>
                  <p className="text-2xl font-bold">{userStats.totalStars}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <GitFork className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Forks</p>
                  <p className="text-2xl font-bold">{userStats.totalForks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Followers</p>
                  <p className="text-2xl font-bold">{userStats.followers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Repositories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Recent Repositories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : repositories.length > 0 ? (
                  repositories.slice(0, 5).map((repo) => <GitHubRepoCard key={repo.id} repo={repo} compact />)
                ) : (
                  <p className="text-gray-500 text-center py-4">No repositories found</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Issues */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Assigned Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : issues.length > 0 ? (
                  issues.slice(0, 5).map((issue) => <GitHubIssueCard key={issue.id} issue={issue} compact />)
                ) : (
                  <p className="text-gray-500 text-center py-4">No assigned issues</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Pull Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitPullRequest className="h-5 w-5" />
                Recent Pull Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse h-24 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : pullRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pullRequests.slice(0, 4).map((pr) => (
                    <GitHubPRCard key={pr.id} pr={pr} compact />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent pull requests</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repositories" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Repositories</h2>
            <Badge variant="outline">{repositories.length} repositories</Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repositories.map((repo) => (
                <GitHubRepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Assigned Issues</h2>
            <Badge variant="outline">{issues.length} issues</Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {issues.map((issue) => (
                <GitHubIssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pull-requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Pull Requests</h2>
            <Badge variant="outline">{pullRequests.length} pull requests</Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pullRequests.map((pr) => (
                <GitHubPRCard key={pr.id} pr={pr} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {userStats && (
              <>
                <GitHubStats userStats={userStats} />
                <GitHubActivity repositories={repositories} />
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
