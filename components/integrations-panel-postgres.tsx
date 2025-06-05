"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePostgresIntegrations } from "@/hooks/use-postgres-integrations"
import { Loader2, Database, Users, Activity, Trash2 } from "lucide-react"

export function IntegrationsPanelPostgres() {
  const {
    integrations,
    stats,
    isLoading,
    isRestored,
    welcomeMessage,
    saveIntegration,
    updateIntegration,
    removeIntegration,
    toggleIntegration,
    refreshIntegrations,
  } = usePostgresIntegrations()

  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const handleConnectGoogle = async () => {
    setIsConnecting("google")
    try {
      // Simulate Google OAuth flow
      const mockGoogleIntegration = {
        integration_id: `google_${Date.now()}`,
        integration_name: "Google Workspace",
        provider: "google",
        account_id: "user@gmail.com",
        account_email: "user@gmail.com",
        account_name: "John Doe",
        account_avatar: "/placeholder.svg?height=32&width=32",
        scopes: ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/calendar"],
        is_enabled: true,
        is_active: true,
        settings: { emailSync: true, calendarSync: true },
        metadata: { connectedVia: "oauth" },
      }

      await saveIntegration(mockGoogleIntegration)
    } finally {
      setIsConnecting(null)
    }
  }

  const handleConnectGitHub = async () => {
    setIsConnecting("github")
    try {
      // Simulate GitHub OAuth flow
      const mockGitHubIntegration = {
        integration_id: `github_${Date.now()}`,
        integration_name: "GitHub",
        provider: "github",
        account_id: "johndoe",
        account_email: "john@example.com",
        account_name: "John Doe",
        account_avatar: "/placeholder.svg?height=32&width=32",
        scopes: ["repo", "read:user"],
        is_enabled: true,
        is_active: true,
        settings: { repoSync: true, issueSync: true },
        metadata: { connectedVia: "oauth" },
      }

      await saveIntegration(mockGitHubIntegration)
    } finally {
      setIsConnecting(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading integrations...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Back Message */}
      {isRestored && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">{welcomeMessage}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Integrations</p>
                <p className="text-2xl font-bold">{stats.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Providers</p>
                <p className="text-2xl font-bold">{Object.keys(stats.byProvider || {}).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Integrations</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {integrations.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No integrations yet</h3>
                <p className="text-gray-600 mb-4">Connect your first integration to get started</p>
                <Button onClick={() => document.querySelector('[data-tab="available"]')?.click()}>
                  Browse Available Integrations
                </Button>
              </CardContent>
            </Card>
          ) : (
            integrations.map((integration) => (
              <Card key={integration.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={integration.account_avatar || "/placeholder.svg?height=40&width=40"}
                        alt={integration.account_name || integration.provider}
                        className="h-10 w-10 rounded-full"
                      />
                      <div>
                        <h3 className="font-medium">{integration.integration_name}</h3>
                        <p className="text-sm text-gray-600">{integration.account_email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary">{integration.provider}</Badge>
                          <Badge variant={integration.is_enabled ? "default" : "secondary"}>
                            {integration.is_enabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={integration.is_enabled}
                        onCheckedChange={(checked) => toggleIntegration(integration.id, checked)}
                      />
                      <Button variant="outline" size="sm" onClick={() => removeIntegration(integration.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <span>Google Workspace</span>
                </CardTitle>
                <CardDescription>Connect Gmail and Google Calendar for email and scheduling assistance</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleConnectGoogle} disabled={isConnecting === "google"} className="w-full">
                  {isConnecting === "google" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Google"
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">GH</span>
                  </div>
                  <span>GitHub</span>
                </CardTitle>
                <CardDescription>
                  Access repositories, issues, and pull requests for development assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleConnectGitHub} disabled={isConnecting === "github"} className="w-full">
                  {isConnecting === "github" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect GitHub"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Provider Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.entries(stats.byProvider || {}).map(([provider, count]) => (
                  <div key={provider} className="flex justify-between items-center py-2">
                    <span className="capitalize">{provider}</span>
                    <Badge>{count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recently Used</CardTitle>
              </CardHeader>
              <CardContent>
                {stats.recentlyUsed?.length > 0 ? (
                  stats.recentlyUsed.map((integration: any) => (
                    <div key={integration.id} className="flex items-center space-x-2 py-2">
                      <img
                        src={integration.account_avatar || "/placeholder.svg?height=24&width=24"}
                        alt={integration.integration_name}
                        className="h-6 w-6 rounded-full"
                      />
                      <span className="text-sm">{integration.integration_name}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-sm">No recent usage</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={refreshIntegrations}>
          <Database className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        <p className="text-sm text-gray-600">Powered by Vercel Postgres</p>
      </div>
    </div>
  )
}
