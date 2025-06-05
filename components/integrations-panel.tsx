"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, MessageSquare, Github, FileText, CheckSquare, Users, Zap, History } from "lucide-react"
import { AccountSelectionModal } from "./account-selection-modal"
import { IntegrationHistory } from "./integration-history"
import { toast } from "@/components/ui/use-toast"
import type { Integration } from "@/lib/types"

const iconMap = {
  Calendar,
  Mail,
  MessageSquare,
  Github,
  FileText,
  CheckSquare,
  Users,
  Zap,
}

export function IntegrationsPanel() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null)
  const [showAccountSelection, setShowAccountSelection] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [persistentData, setPersistentData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load persistent integration data
  useEffect(() => {
    if (session?.user?.email) {
      loadPersistentData()
    }
  }, [session?.user?.email])

  const loadPersistentData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/integrations-persistent")
      if (response.ok) {
        const data = await response.json()
        setPersistentData(data.data)

        // Update integrations based on persistent data
        updateIntegrationsFromPersistent(data.data.integrations)

        // Show welcome back message if user has previous integrations
        if (data.data.integrations.length > 0) {
          toast({
            title: "Welcome back!",
            description: `Restored ${data.data.stats.activeIntegrations} active integrations from your previous session.`,
            variant: "default",
          })
        }
      }
    } catch (error) {
      console.error("Error loading persistent data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateIntegrationsFromPersistent = (storedIntegrations: any[]) => {
    const baseIntegrations: Integration[] = [
      {
        id: "google-calendar",
        name: "Google Calendar",
        icon: "Calendar",
        enabled: !!session?.accessToken,
        connected: !!session?.accessToken,
        scopes: ["calendar.readonly", "calendar.events"],
        description: "Access your calendar events and create new ones",
      },
      {
        id: "gmail",
        name: "Gmail",
        icon: "Mail",
        enabled: !!session?.accessToken,
        connected: !!session?.accessToken,
        scopes: ["gmail.readonly"],
        description: "Read and analyze your email messages",
      },
      {
        id: "github",
        name: "GitHub",
        icon: "Github",
        enabled: false,
        connected: false,
        scopes: ["repo", "notifications", "user:email"],
        description: "Monitor your repositories, issues, and pull requests",
      },
      {
        id: "slack",
        name: "Slack",
        icon: "MessageSquare",
        enabled: false,
        connected: false,
        scopes: ["channels:read", "chat:write"],
        description: "Access your Slack messages and channels",
      },
      {
        id: "notion",
        name: "Notion",
        icon: "FileText",
        enabled: false,
        connected: false,
        scopes: ["read_content", "insert_content"],
        description: "Access your Notion pages and databases",
      },
      {
        id: "linear",
        name: "Linear",
        icon: "CheckSquare",
        enabled: false,
        connected: false,
        scopes: ["read", "write"],
        description: "Manage your Linear issues and projects",
      },
      {
        id: "microsoft-teams",
        name: "Microsoft Teams",
        icon: "Users",
        enabled: false,
        connected: false,
        scopes: ["chat.read", "calendars.read"],
        description: "Access your Teams messages and meetings",
      },
    ]

    // Update integrations based on stored data
    const updatedIntegrations = baseIntegrations.map((integration) => {
      const stored = storedIntegrations.find((s) => s.integrationId === integration.id && s.isActive)
      if (stored) {
        return {
          ...integration,
          connected: true,
          enabled: stored.isEnabled,
        }
      }
      return integration
    })

    setIntegrations(updatedIntegrations)
  }

  // Check for success or error messages in URL
  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (success) {
      if (success === "github_connected") {
        toast({
          title: "GitHub Connected",
          description: "Your GitHub account has been successfully connected.",
          variant: "default",
        })

        setIntegrations((prev) =>
          prev.map((int) => (int.id === "github" ? { ...int, connected: true, enabled: true } : int)),
        )
      } else if (success === "google_connected") {
        toast({
          title: "Google Account Connected",
          description: "Your Google account has been successfully connected.",
          variant: "default",
        })

        setIntegrations((prev) =>
          prev.map((int) =>
            int.id === "google-calendar" || int.id === "gmail" ? { ...int, connected: true, enabled: true } : int,
          ),
        )
      }
    }

    if (error) {
      toast({
        title: "Connection Failed",
        description:
          error === "oauth_failed"
            ? "Failed to initiate the connection. Please try again."
            : "Failed to complete the connection. Please try again.",
        variant: "destructive",
      })
    }
  }, [searchParams])

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration)
    setShowAccountSelection(true)
  }

  const handleAccountSelected = async (accountId: string, isNewAccount: boolean) => {
    if (selectedIntegration) {
      // Update the integration status
      setIntegrations((prev) =>
        prev.map((int) => (int.id === selectedIntegration.id ? { ...int, connected: true, enabled: true } : int)),
      )

      // Save to persistent storage
      try {
        await fetch("/api/integrations-persistent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            integration: {
              integrationId: selectedIntegration.id,
              integrationName: selectedIntegration.name,
              provider: selectedIntegration.id.includes("google") ? "google" : selectedIntegration.id,
              accountId,
              accountEmail: session?.user?.email || "",
              accountName: session?.user?.name || "",
              accessToken: "temp_token", // This would be the actual token
              scopes: selectedIntegration.scopes,
              isEnabled: true,
              isActive: true,
              settings: {},
              metadata: {
                totalUsage: 0,
                errorCount: 0,
              },
            },
          }),
        })
      } catch (error) {
        console.error("Error saving integration:", error)
      }

      toast({
        title: "Integration Connected",
        description: `${selectedIntegration.name} has been successfully connected and saved.`,
        variant: "default",
      })
    }
    setShowAccountSelection(false)
    setSelectedIntegration(null)
  }

  const handleToggle = async (integrationId: string, enabled: boolean) => {
    // Update the UI optimistically
    setIntegrations((prev) => prev.map((int) => (int.id === integrationId ? { ...int, enabled } : int)))

    // Update persistent storage
    try {
      const storedIntegration = persistentData?.integrations?.find((i: any) => i.integrationId === integrationId)
      if (storedIntegration) {
        await fetch("/api/integrations-persistent", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            integrationId: storedIntegration.id,
            updates: { isEnabled: enabled },
          }),
        })
      }
    } catch (error) {
      console.error("Error updating integration:", error)
    }

    toast({
      title: enabled ? "Integration Enabled" : "Integration Disabled",
      description: `${integrations.find((i) => i.id === integrationId)?.name} has been ${enabled ? "enabled" : "disabled"}.`,
      variant: "default",
    })
  }

  const handleDisconnect = async (integrationId: string) => {
    // For Google integrations, we can't really disconnect without signing out
    if (integrationId === "google-calendar" || integrationId === "gmail") {
      toast({
        title: "Cannot Disconnect",
        description: "Google integrations are tied to your login session. Sign out to disconnect.",
        variant: "destructive",
      })
      return
    }

    // Update the UI optimistically
    setIntegrations((prev) =>
      prev.map((int) => (int.id === integrationId ? { ...int, connected: false, enabled: false } : int)),
    )

    // Remove from persistent storage
    try {
      const storedIntegration = persistentData?.integrations?.find((i: any) => i.integrationId === integrationId)
      if (storedIntegration) {
        await fetch(`/api/integrations-persistent?integrationId=${storedIntegration.id}`, {
          method: "DELETE",
        })
      }
    } catch (error) {
      console.error("Error removing integration:", error)
    }

    toast({
      title: "Integration Disconnected",
      description: `${integrations.find((i) => i.id === integrationId)?.name} has been disconnected.`,
      variant: "default",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Integrations</h2>
          <p className="text-gray-600">Connect your favorite tools to enhance your AI assistant</p>
          {session?.user?.email && (
            <p className="text-sm text-gray-500 mt-1">Currently signed in as: {session.user.email}</p>
          )}
          {persistentData?.stats && (
            <p className="text-sm text-green-600 mt-1">
              {persistentData.stats.activeIntegrations} active integrations • {persistentData.stats.totalIntegrations}{" "}
              total connections
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowHistory(true)}>
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((integration) => {
          const IconComponent = iconMap[integration.icon as keyof typeof iconMap]
          const storedIntegration = persistentData?.integrations?.find((i: any) => i.integrationId === integration.id)

          return (
            <Card key={integration.id} className={integration.connected ? "border-green-200" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${integration.connected ? "bg-green-100" : "bg-gray-100"}`}>
                      <IconComponent
                        className={`h-5 w-5 ${integration.connected ? "text-green-600" : "text-gray-600"}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={integration.connected ? "default" : "secondary"}>
                          {integration.connected ? "Connected" : "Not Connected"}
                        </Badge>
                        {integration.enabled && <Badge variant="outline">Enabled</Badge>}
                        {storedIntegration && (
                          <Badge variant="outline" className="text-xs">
                            Used {storedIntegration.metadata.totalUsage} times
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={integration.enabled}
                    disabled={!integration.connected}
                    onCheckedChange={(enabled) => handleToggle(integration.id, enabled)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                {storedIntegration && (
                  <div className="text-xs text-gray-500 mb-2">
                    Last used:{" "}
                    {new Date(
                      storedIntegration.metadata.lastUsedAt || storedIntegration.updatedAt,
                    ).toLocaleDateString()}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">Scopes: {integration.scopes.join(", ")}</div>
                  <div className="flex gap-2">
                    {integration.connected ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleConnect(integration)}>
                          Change Account
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDisconnect(integration.id)}>
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button variant="default" size="sm" onClick={() => handleConnect(integration)}>
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6 text-center">
          <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="font-semibold mb-2">More Integrations Coming Soon</h3>
          <p className="text-sm text-gray-600 mb-4">
            We're working on adding more integrations to make your AI assistant even more powerful.
          </p>
          <Button variant="outline">Request Integration</Button>
        </CardContent>
      </Card>

      {/* Account Selection Modal */}
      <AccountSelectionModal
        isOpen={showAccountSelection}
        onClose={() => setShowAccountSelection(false)}
        integration={selectedIntegration}
        onAccountSelected={handleAccountSelected}
      />

      {/* Integration History Modal */}
      <IntegrationHistory isOpen={showHistory} onClose={() => setShowHistory(false)} data={persistentData} />
    </div>
  )
}
