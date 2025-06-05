"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Settings, CheckCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function GitHubSetupGuide() {
  const [isOpen, setIsOpen] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    })
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_NEXTAUTH_URL || "http://localhost:3000"}/api/auth/oauth/github/callback`

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Setup Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            GitHub OAuth App Setup
          </DialogTitle>
          <DialogDescription>
            Follow these steps to configure your GitHub OAuth application for dRAGon integration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">1</Badge>
                Create GitHub OAuth App
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Go to your GitHub Developer Settings to create a new OAuth application.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open("https://github.com/settings/applications/new", "_blank")}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open GitHub Developer Settings
              </Button>
            </CardContent>
          </Card>

          {/* Step 2 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">2</Badge>
                Configure OAuth App Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Application name</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">dRAGon AI Assistant</code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard("dRAGon AI Assistant")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Homepage URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                      {process.env.NEXT_PUBLIC_NEXTAUTH_URL || "http://localhost:3000"}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(process.env.NEXT_PUBLIC_NEXTAUTH_URL || "http://localhost:3000")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Application description</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm flex-1">
                      AI-powered productivity assistant with GitHub integration
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard("AI-powered productivity assistant with GitHub integration")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-red-600">Authorization callback URL (Important!)</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-red-50 border border-red-200 px-2 py-1 rounded text-sm flex-1 text-red-800">
                      {redirectUri}
                    </code>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(redirectUri)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    ⚠️ This must match exactly! Copy and paste this URL into the GitHub OAuth app settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 3 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">3</Badge>
                Get Client Credentials
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                After creating the OAuth app, GitHub will provide you with a Client ID and Client Secret.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Copy the Client ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Generate and copy the Client Secret</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Step 4 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">4</Badge>
                Update Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Add these environment variables to your <code>.env.local</code> file:
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono">
                <div className="space-y-1">
                  <div>GITHUB_CLIENT_ID=your_client_id_here</div>
                  <div>GITHUB_CLIENT_SECRET=your_client_secret_here</div>
                  <div>NEXTAUTH_URL={process.env.NEXT_PUBLIC_NEXTAUTH_URL || "http://localhost:3000"}</div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  copyToClipboard(`GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
NEXTAUTH_URL=${process.env.NEXT_PUBLIC_NEXTAUTH_URL || "http://localhost:3000"}`)
                }
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Environment Variables
              </Button>
            </CardContent>
          </Card>

          {/* Step 5 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline">5</Badge>
                Restart Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                After updating the environment variables, restart your development server for the changes to take
                effect.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setIsOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
