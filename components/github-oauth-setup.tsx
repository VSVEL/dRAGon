"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { GithubIcon, InfoIcon, ExternalLinkIcon, KeyIcon } from "lucide-react"

export function GitHubOAuthSetup() {
  return (
    <div className="space-y-6">
      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>GitHub Integration Setup Required</AlertTitle>
        <AlertDescription>
          To connect your GitHub account, you need to set up GitHub OAuth in your application.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GithubIcon className="h-5 w-5" />
            GitHub OAuth Setup Guide
          </CardTitle>
          <CardDescription>Follow these steps to enable GitHub integration in your dRAGon AI assistant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                1
              </Badge>
              <div>
                <h4 className="font-medium">Create a GitHub OAuth App</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Go to GitHub Settings → Developer settings → OAuth Apps → New OAuth App
                </p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <a href="https://github.com/settings/applications/new" target="_blank" rel="noopener noreferrer">
                    <ExternalLinkIcon className="h-4 w-4 mr-2" />
                    Create OAuth App
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                2
              </Badge>
              <div>
                <h4 className="font-medium">Configure OAuth App Settings</h4>
                <div className="text-sm text-gray-600 mt-1 space-y-1">
                  <p>
                    <strong>Application name:</strong> dRAGon AI Assistant
                  </p>
                  <p>
                    <strong>Homepage URL:</strong> http://localhost:3000
                  </p>
                  <p>
                    <strong>Authorization callback URL:</strong> http://localhost:3000/api/auth/callback/github
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                3
              </Badge>
              <div>
                <h4 className="font-medium">Add Environment Variables</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Add these to your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:
                </p>
                <div className="bg-gray-50 p-3 rounded-md mt-2 text-sm font-mono">
                  <div>GITHUB_CLIENT_ID=your_github_client_id</div>
                  <div>GITHUB_CLIENT_SECRET=your_github_client_secret</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                4
              </Badge>
              <div>
                <h4 className="font-medium">Update NextAuth Configuration</h4>
                <p className="text-sm text-gray-600 mt-1">
                  The GitHub provider should be added to your NextAuth configuration in{" "}
                  <code className="bg-gray-100 px-1 rounded">lib/auth.ts</code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">
                5
              </Badge>
              <div>
                <h4 className="font-medium">Restart Your Application</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Restart your development server to apply the new environment variables
                </p>
              </div>
            </div>
          </div>

          <Alert>
            <KeyIcon className="h-4 w-4" />
            <AlertTitle>Demo Mode Available</AlertTitle>
            <AlertDescription>
              While setting up GitHub OAuth, you can use the demo mode to see how the GitHub dashboard works with sample
              data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
