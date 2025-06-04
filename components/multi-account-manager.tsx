"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Trash2, Github, Mail, Calendar, Settings, CheckCircle } from "lucide-react"
import { DragonLogo } from "./dragon-logo"
import type { UserAccount, UserIntegration } from "@/lib/database/schema"
import { AccountManager } from "@/lib/account-manager"

interface AccountWithIntegrations {
  account: UserAccount
  integrations: UserIntegration[]
  availableIntegrations: string[]
}

const providerIcons = {
  google: Mail,
  github: Github,
  slack: Settings,
  microsoft: Settings,
}

const integrationIcons = {
  gmail: Mail,
  calendar: Calendar,
  github: Github,
  slack: Settings,
}

export function MultiAccountManager() {
  const { data: session } = useSession()
  const [accounts, setAccounts] = useState<AccountWithIntegrations[]>([])
  const [accountManager, setAccountManager] = useState<AccountManager | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.email) {
      const manager = new AccountManager(session.user.email)
      manager.loadUserAccounts().then(() => {
        setAccountManager(manager)
        loadAccounts(manager)
        setIsLoading(false)
      })
    }
  }, [session])

  const loadAccounts = (manager: AccountManager) => {
    const allAccounts = manager.getAllAccounts()
    const accountsWithIntegrations: AccountWithIntegrations[] = allAccounts.map((account) => {
      const integrations = manager.getEnabledIntegrations(account.id)
      const availableIntegrations = getAvailableIntegrations(account.provider)

      return {
        account,
        integrations,
        availableIntegrations,
      }
    })

    setAccounts(accountsWithIntegrations)
  }

  const getAvailableIntegrations = (provider: UserAccount["provider"]): string[] => {
    switch (provider) {
      case "google":
        return ["gmail", "calendar"]
      case "github":
        return ["github"]
      case "slack":
        return ["slack"]
      case "microsoft":
        return ["outlook", "teams"]
      default:
        return []
    }
  }

  const handleAddAccount = async (provider: UserAccount["provider"]) => {
    // This would trigger OAuth flow for the specific provider
    console.log(`Adding ${provider} account...`)

    // Simulate adding an account for demo
    if (accountManager) {
      const newAccount: UserAccount = {
        id: `${provider}_${Date.now()}`,
        userId: session?.user?.email || "",
        provider,
        providerAccountId: `${provider}_user_${Date.now()}`,
        accountEmail: `user@${provider}.com`,
        accountName: `${provider} User`,
        accessToken: "demo_token",
        scopes: provider === "github" ? ["repo", "notifications"] : ["email", "profile"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      accountManager.addAccount(newAccount)
      loadAccounts(accountManager)
    }
  }

  const handleRemoveAccount = (accountId: string) => {
    if (accountManager) {
      accountManager.removeAccount(accountId)
      loadAccounts(accountManager)
    }
  }

  const handleToggleIntegration = (accountId: string, integrationId: string, enabled: boolean) => {
    if (accountManager) {
      if (enabled) {
        accountManager.enableIntegration(accountId, integrationId)
      } else {
        accountManager.disableIntegration(accountId, integrationId)
      }
      loadAccounts(accountManager)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <DragonLogo size="lg" className="animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Connected Accounts</h2>
          <p className="text-gray-600">Manage your connected accounts and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleAddAccount("google")} variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Add Google
          </Button>
          <Button onClick={() => handleAddAccount("github")} variant="outline" size="sm">
            <Github className="h-4 w-4 mr-2" />
            Add GitHub
          </Button>
        </div>
      </div>

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <DragonLogo size="lg" className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Accounts Connected</h3>
            <p className="text-gray-600 mb-4">Connect your accounts to enable AI-powered insights across your tools</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => handleAddAccount("google")}>
                <Mail className="h-4 w-4 mr-2" />
                Connect Google
              </Button>
              <Button onClick={() => handleAddAccount("github")} variant="outline">
                <Github className="h-4 w-4 mr-2" />
                Connect GitHub
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {accounts.map(({ account, integrations, availableIntegrations }) => {
            const ProviderIcon = providerIcons[account.provider]

            return (
              <Card key={account.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://github.com/${account.accountName}.png`} />
                        <AvatarFallback>
                          <ProviderIcon className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{account.accountName}</CardTitle>
                        <p className="text-sm text-gray-600">{account.accountEmail}</p>
                      </div>
                      <Badge variant={account.isActive ? "default" : "secondary"}>
                        {account.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveAccount(account.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Available Integrations</h4>
                      <div className="space-y-2">
                        {availableIntegrations.map((integrationId) => {
                          const isEnabled = integrations.some((i) => i.integrationId === integrationId && i.isEnabled)
                          const IntegrationIcon = integrationIcons[integrationId as keyof typeof integrationIcons]

                          return (
                            <div
                              key={integrationId}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <IntegrationIcon className="h-5 w-5" />
                                <div>
                                  <div className="font-medium capitalize">{integrationId}</div>
                                  <div className="text-sm text-gray-600">
                                    {getIntegrationDescription(integrationId)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isEnabled && <CheckCircle className="h-4 w-4 text-green-500" />}
                                <Switch
                                  checked={isEnabled}
                                  onCheckedChange={(checked) =>
                                    handleToggleIntegration(account.id, integrationId, checked)
                                  }
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Connected: {new Date(account.createdAt).toLocaleDateString()}</span>
                        <span>Scopes: {account.scopes.join(", ")}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Account Options */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6 text-center">
          <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="font-semibold mb-2">Add More Accounts</h3>
          <p className="text-sm text-gray-600 mb-4">Connect additional accounts to get more comprehensive insights</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button onClick={() => handleAddAccount("google")} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" />
              Google Account
            </Button>
            <Button onClick={() => handleAddAccount("github")} variant="outline" size="sm">
              <Github className="h-4 w-4 mr-2" />
              GitHub Account
            </Button>
            <Button variant="outline" size="sm" disabled>
              <Settings className="h-4 w-4 mr-2" />
              Slack (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getIntegrationDescription(integrationId: string): string {
  switch (integrationId) {
    case "gmail":
      return "Access your Gmail messages and insights"
    case "calendar":
      return "Manage your Google Calendar events"
    case "github":
      return "Monitor repositories, issues, and pull requests"
    case "slack":
      return "Access Slack messages and channels"
    default:
      return "Integration description"
  }
}
