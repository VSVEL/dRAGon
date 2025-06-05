"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Mail, Calendar, Trash2, Crown, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface GoogleAccount {
  id: string
  email: string
  name: string
  picture?: string
  isActive: boolean
  isPrimary: boolean
  connectedAt: string
  lastUsed?: string
}

export function GoogleAccountsManager() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [accounts, setAccounts] = useState<GoogleAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingAccount, setIsAddingAccount] = useState(false)

  useEffect(() => {
    loadAccounts()
  }, [])

  const loadAccounts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/google-accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error("Error loading accounts:", error)
      toast({
        title: "Error",
        description: "Failed to load Google accounts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addAccount = async () => {
    setIsAddingAccount(true)
    try {
      // Redirect to add account flow
      window.location.href = `/api/auth/google/add-account?returnUrl=${encodeURIComponent(window.location.pathname)}`
    } catch (error) {
      console.error("Error adding account:", error)
      setIsAddingAccount(false)
    }
  }

  const toggleAccount = async (email: string, isActive: boolean) => {
    try {
      const response = await fetch("/api/google-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", email, isActive }),
      })

      if (response.ok) {
        setAccounts((prev) => prev.map((account) => (account.email === email ? { ...account, isActive } : account)))
        toast({
          title: "Success",
          description: `Account ${isActive ? "enabled" : "disabled"}`,
        })
      }
    } catch (error) {
      console.error("Error toggling account:", error)
      toast({
        title: "Error",
        description: "Failed to update account",
        variant: "destructive",
      })
    }
  }

  const removeAccount = async (email: string) => {
    if (email === session?.user?.email) {
      toast({
        title: "Error",
        description: "Cannot remove primary account",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/google-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", email }),
      })

      if (response.ok) {
        setAccounts((prev) => prev.filter((account) => account.email !== email))
        toast({
          title: "Success",
          description: "Account removed",
        })
      }
    } catch (error) {
      console.error("Error removing account:", error)
      toast({
        title: "Error",
        description: "Failed to remove account",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Google Accounts
            </CardTitle>
            <CardDescription>Manage your connected Google accounts for Gmail and Calendar</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadAccounts} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={addAccount} disabled={isAddingAccount} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {accounts.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No Google accounts connected</p>
              <Button onClick={addAccount} className="mt-4" disabled={isAddingAccount}>
                <Plus className="h-4 w-4 mr-2" />
                Connect Your First Account
              </Button>
            </div>
          ) : (
            accounts.map((account) => (
              <div
                key={account.email}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={account.picture || "/placeholder.svg"} />
                    <AvatarFallback>
                      <Mail className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{account.name}</span>
                      {account.isPrimary && (
                        <Badge variant="outline" className="text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Primary
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{account.email}</div>
                    {account.lastUsed && (
                      <div className="text-xs text-gray-500">
                        Last used: {new Date(account.lastUsed).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <Switch
                    checked={account.isActive}
                    onCheckedChange={(checked) => toggleAccount(account.email, checked)}
                    disabled={account.isPrimary} // Primary account is always active
                  />
                  {!account.isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAccount(account.email)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {accounts.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Multi-Account Features</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• View emails and calendar events from all active accounts</li>
              <li>• AI assistant can access data across all connected accounts</li>
              <li>• Each account's data is clearly labeled in the interface</li>
              <li>• Toggle accounts on/off without disconnecting them</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
