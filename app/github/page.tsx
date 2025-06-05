"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DragonLogo } from "@/components/dragon-logo"
import { GithubIcon, GitPullRequestIcon, GitGraphIcon as GitIssueIcon, BarChartIcon, BookIcon } from "lucide-react"

export default function GitHubDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [repos, setRepos] = useState([])
  const [issues, setIssues] = useState([])
  const [prs, setPrs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    if (status === "authenticated") {
      fetchGitHubData()
    }
  }, [status, router])

  const fetchGitHubData = async () => {
    setLoading(true)
    try {
      // Fetch repositories
      const reposRes = await fetch("/api/github/repos")
      const reposData = await reposRes.json()
      setRepos(reposData.repos || [])

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
    } finally {
      setLoading(false)
    }
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
                        <div className="text-2xl font-bold">{stats?.stars || 0}</div>
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
                                <GitIssueIcon className="h-4 w-4 mr-2 text-yellow-500" />
                                <span className="font-medium">{issue.title}</span>
                              </div>
                              <div className="text-sm text-gray-500">{issue.repository}</div>
                            </div>
                          ))}
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
                  ) : (
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
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                ></path>
                              </svg>
                              {repo.stars || 0}
                            </div>
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                ></path>
                              </svg>
                              {repo.forks || 0}
                            </div>
                          </div>
                        </div>
                      ))}
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
                            <GitIssueIcon className="h-5 w-5 text-yellow-500" />
                            <h3 className="font-semibold text-lg">{issue.title}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span className="font-medium">{issue.repository}</span>
                            <span>•</span>
                            <span>#{issue.number}</span>
                            <span>•</span>
                            <span>Opened on {new Date(issue.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {issue.labels?.map((label) => (
                              <span key={label} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {label}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GitIssueIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
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
                            {pr.isDraft && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">Draft</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                            <span className="font-medium">{pr.repository}</span>
                            <span>•</span>
                            <span>#{pr.number}</span>
                            <span>•</span>
                            <span>Opened on {new Date(pr.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">{pr.sourceBranch}</span> →{" "}
                            <span className="font-medium">{pr.targetBranch}</span>
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
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <BarChartIcon className="h-24 w-24 text-gray-300" />
                        <div className="text-center">
                          <p className="text-gray-500 mt-4">Language chart will appear here</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contribution Activity</CardTitle>
                    <CardDescription>Your GitHub activity over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {loading ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <BarChartIcon className="h-24 w-24 text-gray-300" />
                        <div className="text-center">
                          <p className="text-gray-500 mt-4">Activity chart will appear here</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
