"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DragonLogo } from "@/components/dragon-logo"
import {
  GithubIcon,
  GitPullRequestIcon,
  GitBranchIcon,
  BarChartIcon,
  BookIcon,
  AlertCircleIcon,
  StarIcon,
  GitForkIcon,
  UsersIcon,
  InfoIcon,
} from "lucide-react"
import { toast } from "@/components/ui/use-toast"

// Mock data for demonstration
const MOCK_DATA = {
  repos: [
    {
      id: 1,
      name: "project-alpha",
      description: "A sample project",
      language: "TypeScript",
      stars: 12,
      forks: 5,
      updatedAt: "2023-05-15T10:30:00Z",
    },
    {
      id: 2,
      name: "awesome-app",
      description: "An awesome application",
      language: "JavaScript",
      stars: 45,
      forks: 12,
      updatedAt: "2023-06-20T14:15:00Z",
    },
    {
      id: 3,
      name: "data-viz",
      description: "Data visualization tools",
      language: "Python",
      stars: 28,
      forks: 8,
      updatedAt: "2023-07-05T09:45:00Z",
    },
    {
      id: 4,
      name: "api-service",
      description: "RESTful API service",
      language: "Go",
      stars: 17,
      forks: 3,
      updatedAt: "2023-08-10T16:20:00Z",
    },
    {
      id: 5,
      name: "mobile-app",
      description: "Cross-platform mobile app",
      language: "Dart",
      stars: 33,
      forks: 9,
      updatedAt: "2023-09-01T11:10:00Z",
    },
  ],
  issues: [
    {
      id: 101,
      title: "Fix authentication bug",
      repository: "project-alpha",
      number: 42,
      labels: ["bug", "high-priority"],
      createdAt: "2023-08-15T10:30:00Z",
    },
    {
      id: 102,
      title: "Add dark mode support",
      repository: "awesome-app",
      number: 57,
      labels: ["enhancement", "ui"],
      createdAt: "2023-09-02T14:15:00Z",
    },
    {
      id: 103,
      title: "Improve performance",
      repository: "data-viz",
      number: 23,
      labels: ["performance"],
      createdAt: "2023-09-10T09:45:00Z",
    },
  ],
  prs: [
    {
      id: 201,
      title: "Implement user authentication",
      repository: "project-alpha",
      number: 45,
      sourceBranch: "feature/auth",
      targetBranch: "main",
      isDraft: false,
      createdAt: "2023-08-20T10:30:00Z",
    },
    {
      id: 202,
      title: "Add new visualization component",
      repository: "data-viz",
      number: 28,
      sourceBranch: "feature/pie-chart",
      targetBranch: "develop",
      isDraft: true,
      createdAt: "2023-09-05T14:15:00Z",
    },
  ],
  stats: {
    stars: 135,
    forks: 37,
    followers: 42,
    following: 28,
    publicRepos: 15,
    privateRepos: 8,
    languages: {
      JavaScript: 8,
      TypeScript: 6,
      Python: 4,
      Go: 3,
      Dart: 2,
    },
  },
}

export default function GitHubDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repos, setRepos] = useState([])
  const [issues, setIssues] = useState([])
  const [prs, setPrs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [showMockData, setShowMockData] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (status === "authenticated") {
      checkGitHubConnection()
    }
  }, [status, router])

  const checkGitHubConnection = async () => {
    try {
      const response = await fetch("/api/github/repos")

      if (response.ok) {
        const data = await response.json()
        if (data.error && data.error.includes("No GitHub access token")) {
          setIsConnected(false)
          setLoading(false)
        } else {
          setIsConnected(true)
          fetchGitHubData()
        }
      } else {
        setIsConnected(false)
        setLoading(false)
      }
    } catch (error) {
      console.error("Error checking GitHub connection:", error)
      setIsConnected(false)
      setLoading(false)
    }
  }

  const fetchGitHubData = async () => {
    setLoading(true)
    try {
      // Fetch repositories
      const reposRes = await fetch("/api/github/repos")
      const reposData = await reposRes.json()
      setRepos(reposData.repositories || [])

      // Fetch issues
      const issuesRes = await fetch("/api/github/issues")
      const issuesData = await issuesRes.json()
      setIssues(issuesData.issues || [])

      // Fetch pull requests
      const prsRes = await fetch("/api/github/pull-requests")
      const prsData = await prsRes.json()
      setPrs(prsData.pullRequests || [])

      // Fetch stats
      const statsRes = await fetch("/api/github/stats")
      const statsData = await statsRes.json()
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching GitHub data:", error)
      toast({
        title: "Error fetching GitHub data",
        description: "There was a problem retrieving your GitHub information.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConnectGitHub = () => {
    router.push("/integrations?highlight=github")
  }

  const handleUseMockData = () => {
    setRepos(MOCK_DATA.repos)
    setIssues(MOCK_DATA.issues)
    setPrs(MOCK_DATA.prs)
    setStats(MOCK_DATA.stats)
    setShowMockData(true)
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DragonLogo size="lg" className="mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading GitHub dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <DragonLogo size="lg" className="text-indigo-600" />
            <span className="font-semibold text-xl">dRAGon</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
            Home
          </Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/integrations")}>
            Integrations
          </Button>
          <Button variant="default" size="sm" className="bg-gray-900">
            <GithubIcon className="h-4 w-4 mr-2" />
            GitHub Dashboard
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 flex items-center">
            <GithubIcon className="mr-2" /> GitHub Dashboard
          </h1>

          {!isConnected && !showMockData ? (
            <div className="space-y-6">
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>GitHub Not Connected</AlertTitle>
                <AlertDescription>
                  You need to connect your GitHub account to view your repositories, issues, and pull requests.
                </AlertDescription>
              </Alert>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <GithubIcon className="h-16 w-16 mx-auto text-gray-400" />
                    <div>
                      <h2 className="text-xl font-semibold">Connect Your GitHub Account</h2>
                      <p className="text-gray-600 mt-2 mb-4">
                        Connect your GitHub account to see your repositories, issues, and pull requests.
                      </p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <Button onClick={handleConnectGitHub}>
                        <GithubIcon className="h-4 w-4 mr-2" />
                        Connect GitHub
                      </Button>
                      <Button variant="outline" onClick={handleUseMockData}>
                        View Demo Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              {showMockData && (
                <Alert className="mb-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Demo Mode</AlertTitle>
                  <AlertDescription>
                    You're viewing demo data.{" "}
                    <Button variant="link" className="p-0 h-auto" onClick={handleConnectGitHub}>
                      Connect your GitHub account
                    </Button>{" "}
                    to see your actual data.
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="repositories">Repositories</TabsTrigger>
                  <TabsTrigger value="issues">Issues</TabsTrigger>
                  <TabsTrigger value="pull-requests">Pull Requests</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                          <CardHeader className="pb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </CardHeader>
                          <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Repositories</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{repos.length}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Stars</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalStars || stats?.stars || 0}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{issues.length}</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Pull Requests</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">{prs.length}</div>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>Recent Repositories</CardTitle>
                            <CardDescription>Your recently updated repositories</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {repos.slice(0, 5).map((repo) => (
                                <div
                                  key={repo.id}
                                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                                >
                                  <div className="flex items-center">
                                    <BookIcon className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="font-medium">{repo.name}</span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(repo.updatedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                              {repos.length === 0 && (
                                <div className="text-center py-4 text-gray-500">No repositories found</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>Assigned Issues</CardTitle>
                            <CardDescription>Issues assigned to you</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {issues.slice(0, 5).map((issue) => (
                                <div
                                  key={issue.id}
                                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100"
                                >
                                  <div className="flex items-center">
                                    <AlertCircleIcon className="h-4 w-4 mr-2 text-yellow-500" />
                                    <span className="font-medium">{issue.title}</span>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {issue.repository?.fullName || issue.repository}
                                  </div>
                                </div>
                              ))}
                              {issues.length === 0 && (
                                <div className="text-center py-4 text-gray-500">No issues found</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="repositories">
                  <Card>
                    <CardHeader>
                      <CardTitle>Your Repositories</CardTitle>
                      <CardDescription>All repositories you own or contribute to</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 border rounded-md animate-pulse">
                              <div className="h-5 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                              <div className="flex gap-2">
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                                <div className="h-4 bg-gray-200 rounded w-16"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : repos.length > 0 ? (
                        <div className="space-y-4">
                          {repos.map((repo) => (
                            <div key={repo.id} className="p-4 border rounded-md hover:bg-gray-50">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{repo.name}</h3>
                                <div className="text-sm text-gray-500">
                                  Updated {new Date(repo.updatedAt).toLocaleDateString()}
                                </div>
                              </div>
                              <p className="text-gray-600 mb-3">{repo.description || "No description provided"}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center">
                                  <span className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>
                                  {repo.language || "Unknown"}
                                </div>
                                <div className="flex items-center">
                                  <StarIcon className="w-4 h-4 mr-1 text-yellow-500" />
                                  {repo.stargazersCount || repo.stars || 0}
                                </div>
                                <div className="flex items-center">
                                  <GitForkIcon className="w-4 h-4 mr-1 text-blue-500" />
                                  {repo.forksCount || repo.forks || 0}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <GitBranchIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No repositories found</h3>
                          <p className="text-gray-500">You don't have any repositories yet.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="issues">
                  <Card>
                    <CardHeader>
                      <CardTitle>Issues</CardTitle>
                      <CardDescription>All issues assigned to you</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 border rounded-md animate-pulse">
                              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : issues.length > 0 ? (
                        <div className="space-y-4">
                          {issues.map((issue) => (
                            <div key={issue.id} className="p-4 border rounded-md hover:bg-gray-50">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertCircleIcon className="h-5 w-5 text-yellow-500" />
                                <h3 className="font-semibold text-lg">{issue.title}</h3>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <span className="font-medium">{issue.repository?.fullName || issue.repository}</span>
                                <span>•</span>
                                <span>#{issue.number}</span>
                                <span>•</span>
                                <span>Opened on {new Date(issue.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(issue.labels || []).map((label, index) => (
                                  <span
                                    key={typeof label === "string" ? label : label.name || index}
                                    className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
                                  >
                                    {typeof label === "string" ? label : label.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <AlertCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No issues found</h3>
                          <p className="text-gray-500">You don't have any issues assigned to you.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pull-requests">
                  <Card>
                    <CardHeader>
                      <CardTitle>Pull Requests</CardTitle>
                      <CardDescription>Your open pull requests</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {loading ? (
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 border rounded-md animate-pulse">
                              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          ))}
                        </div>
                      ) : prs.length > 0 ? (
                        <div className="space-y-4">
                          {prs.map((pr) => (
                            <div key={pr.id} className="p-4 border rounded-md hover:bg-gray-50">
                              <div className="flex items-center gap-2 mb-2">
                                <GitPullRequestIcon className="h-5 w-5 text-purple-500" />
                                <h3 className="font-semibold text-lg">{pr.title}</h3>
                                {pr.draft && (
                                  <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                    Draft
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <span className="font-medium">{pr.repository?.fullName || pr.repository}</span>
                                <span>•</span>
                                <span>#{pr.number}</span>
                                <span>•</span>
                                <span>Opened on {new Date(pr.createdAt).toLocaleDateString()}</span>
                              </div>
                              <div className="text-sm text-gray-600">
                                <span className="font-medium">{pr.head?.ref || pr.sourceBranch || "feature"}</span> →{" "}
                                <span className="font-medium">{pr.base?.ref || pr.targetBranch || "main"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <GitPullRequestIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No pull requests found</h3>
                          <p className="text-gray-500">You don't have any open pull requests.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Language Distribution</CardTitle>
                        <CardDescription>Programming languages used in your repositories</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        {loading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                          </div>
                        ) : stats?.languages ? (
                          <div className="h-full p-4">
                            {Object.entries(stats.languages).map(([language, count], index) => (
                              <div key={language} className="mb-4">
                                <div className="flex justify-between mb-1">
                                  <span className="text-sm font-medium">{language}</span>
                                  <span className="text-sm text-gray-500">{count} repos</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-blue-600 h-2.5 rounded-full"
                                    style={{
                                      width: `${(Number(count) / Object.values(stats.languages).reduce((a, b) => Number(a) + Number(b), 0)) * 100}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center flex-col">
                            <BarChartIcon className="h-24 w-24 text-gray-300" />
                            <p className="text-gray-500 mt-4">No language data available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>GitHub Stats</CardTitle>
                        <CardDescription>Your GitHub activity statistics</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        {loading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                          </div>
                        ) : stats ? (
                          <div className="grid grid-cols-2 gap-4 h-full p-4">
                            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                              <UsersIcon className="h-8 w-8 text-purple-500 mb-2" />
                              <div className="text-2xl font-bold">{stats.followers || 0}</div>
                              <div className="text-sm text-gray-500">Followers</div>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                              <UsersIcon className="h-8 w-8 text-blue-500 mb-2" />
                              <div className="text-2xl font-bold">{stats.following || 0}</div>
                              <div className="text-sm text-gray-500">Following</div>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                              <GitBranchIcon className="h-8 w-8 text-green-500 mb-2" />
                              <div className="text-2xl font-bold">{stats.publicRepos || 0}</div>
                              <div className="text-sm text-gray-500">Public Repos</div>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-gray-50 rounded-lg p-4">
                              <GitBranchIcon className="h-8 w-8 text-gray-500 mb-2" />
                              <div className="text-2xl font-bold">{stats.privateRepos || 0}</div>
                              <div className="text-sm text-gray-500">Private Repos</div>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center flex-col">
                            <BarChartIcon className="h-24 w-24 text-gray-300" />
                            <p className="text-gray-500 mt-4">No stats available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
