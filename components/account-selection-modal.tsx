"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Mail, Github, MessageSquare, Users, CheckCircle } from "lucide-react"
import type { Integration } from "@/lib/types"

interface ConnectedAccount {
  id: string
  provider: string
  email: string
  name: string
  image?: string
  isActive: boolean
  connectedAt: string
}

interface AccountSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  integration: Integration | null
  onAccountSelected: (accountId: string, isNewAccount: boolean) => void
}

const providerIcons = {
  google: Mail,
  github: Github,
  slack: MessageSquare,
  microsoft: Users,
}

export function AccountSelectionModal({ isOpen, onClose, integration, onAccountSelected }: AccountSelectionModalProps) {
  const { data: session } = useSession()
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && integration) {
      loadConnectedAccounts()
    }
  }, [isOpen, integration])

  const loadConnectedAccounts = async () => {
    setIsLoading(true)
    try {
      // Fetch connected accounts from the API
      const response = await fetch(`/api/accounts?provider=${getProviderForIntegration(integration?.id || "")}`)

      if (!response.ok) {
        throw new Error("Failed to load accounts")
      }

      const data = await response.json()
      setConnectedAccounts(data.accounts || [])
    } catch (error) {
      console.error("Error loading connected accounts:", error)
      // Fallback to empty accounts list
      setConnectedAccounts([])
    } finally {
      setIsLoading(false)
    }
  }

  const getProviderForIntegration = (integrationId: string): string => {
    if (integrationId.includes("google") || integrationId === "gmail") return "google"
    if (integrationId === "github") return "github"
    if (integrationId === "slack") return "slack"
    if (integrationId.includes("microsoft")) return "microsoft"
    return "google" // default
  }

  const handleSelectAccount = (accountId: string) => {
    onAccountSelected(accountId, false)
  }

  const handleConnectNewAccount = () => {
    const provider = getProviderForIntegration(integration?.id || "")
    const integrationId = integration?.id || ""

    // Redirect to the appropriate OAuth flow
    initiateOAuthFlow(provider, integrationId)
  }

  const initiateOAuthFlow = (provider: string, integrationId: string) => {
    // Store the integration ID in session storage to retrieve after OAuth callback
    sessionStorage.setItem("pendingIntegration", integrationId)

    // Construct the redirect URL based on the provider
    let authUrl = ""

    switch (provider) {
      case "github":
        authUrl = `/api/auth/oauth/github`
        break
      case "google":
        // For Google, we'll use a different endpoint for different scopes based on integration
        authUrl = `/api/auth/oauth/google?integration=${integrationId}`
        break
      case "slack":
        authUrl = `/api/auth/oauth/slack`
        break
      case "microsoft":
        authUrl = `/api/auth/oauth/microsoft`
        break
      default:
        console.error("Unknown provider:", provider)
        return
    }

    // Close the modal before redirecting
    onClose()

    // Redirect to the OAuth flow
    window.location.href = authUrl
  }

  const getProviderDisplayName = (provider: string): string => {
    switch (provider) {
      case "google":
        return "Google"
      case "github":
        return "GitHub"
      case "slack":
        return "Slack"
      case "microsoft":
        return "Microsoft"
      default:
        return provider
    }
  }

  const getProviderIcon = (provider: string) => {
    const IconComponent = providerIcons[provider as keyof typeof providerIcons] || Mail
    return IconComponent
  }

  if (!integration) return null

  const provider = getProviderForIntegration(integration.id)
  const ProviderIcon = getProviderIcon(provider)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ProviderIcon className="h-5 w-5" />
            Connect {integration.name}
          </DialogTitle>
          <DialogDescription>
            Choose which {getProviderDisplayName(provider)} account to use for {integration.name}, or connect a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your accounts...</p>
            </div>
          ) : (
            <>
              {/* Existing Accounts */}
              {connectedAccounts.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Connected Accounts</h4>
                  {connectedAccounts.map((account) => (
                    <Card
                      key={account.id}
                      className="cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleSelectAccount(account.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={account.image || "/placeholder.svg"} />
                              <AvatarFallback>
                                <ProviderIcon className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">{account.name}</div>
                              <div className="text-xs text-gray-600">{account.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {account.isActive && (
                              <Badge variant="outline" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Connect New Account */}
              <div className="space-y-2">
                {connectedAccounts.length > 0 && (
                  <h4 className="text-sm font-medium text-gray-700">Or connect a new account</h4>
                )}
                <Card
                  className="cursor-pointer hover:bg-gray-50 transition-colors border-dashed border-2"
                  onClick={handleConnectNewAccount}
                >
                  <CardContent className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span className="font-medium">Connect New {getProviderDisplayName(provider)} Account</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Sign in with a different {getProviderDisplayName(provider)} account
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Integration Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Required Permissions</h4>
                <div className="text-xs text-blue-700">
                  <p className="mb-1">{integration.description}</p>
                  <p>Scopes: {integration.scopes.join(", ")}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
