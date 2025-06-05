"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export function OAuthDebug() {
  const [isChecking, setIsChecking] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const checkConfiguration = async () => {
    setIsChecking(true)
    try {
      const response = await fetch("/api/debug/oauth")
      const data = await response.json()
      setDebugInfo(data)
    } catch (error) {
      console.error("Debug check failed:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusBadge = (status: boolean) => {
    return <Badge variant={status ? "default" : "destructive"}>{status ? "OK" : "Missing"}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          OAuth Configuration Debug
        </CardTitle>
        <CardDescription>Check your OAuth configuration for common issues</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={checkConfiguration} disabled={isChecking} className="w-full">
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            "Check Configuration"
          )}
        </Button>

        {debugInfo && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">GITHUB_CLIENT_ID</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.github.clientId)}
                {getStatusBadge(debugInfo.github.clientId)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">GITHUB_CLIENT_SECRET</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.github.clientSecret)}
                {getStatusBadge(debugInfo.github.clientSecret)}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">NEXTAUTH_URL</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(debugInfo.nextauth.url)}
                {getStatusBadge(debugInfo.nextauth.url)}
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Current Configuration:</h4>
              <div className="text-xs space-y-1 font-mono">
                <div>Redirect URI: {debugInfo.github.redirectUri}</div>
                <div>Environment: {debugInfo.environment}</div>
              </div>
            </div>

            {!debugInfo.github.clientId ||
              (!debugInfo.github.clientSecret && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    ⚠️ GitHub OAuth is not properly configured. Please follow the setup guide above.
                  </p>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
