"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, User, Mail } from "lucide-react"
import Image from "next/image"

export default function TestAuthPage() {
  const { data: session, status } = useSession()
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isTestingAPIs, setIsTestingAPIs] = useState(false)

  const runAPITests = async () => {
    if (!session?.accessToken) return

    setIsTestingAPIs(true)
    const results: Record<string, any> = {}

    // Test Calendar API
    try {
      const calendarResponse = await fetch("/api/calendar")
      results.calendar = {
        status: calendarResponse.status,
        ok: calendarResponse.ok,
        data: calendarResponse.ok ? await calendarResponse.json() : null,
      }
    } catch (error) {
      results.calendar = { error: error.message }
    }

    // Test Gmail API
    try {
      const emailResponse = await fetch("/api/emails")
      results.emails = {
        status: emailResponse.status,
        ok: emailResponse.ok,
        data: emailResponse.ok ? await emailResponse.json() : null,
      }
    } catch (error) {
      results.emails = { error: error.message }
    }

    // Test Chat API
    try {
      const chatResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Test message" }],
        }),
      })
      results.chat = {
        status: chatResponse.status,
        ok: chatResponse.ok,
      }
    } catch (error) {
      results.chat = { error: error.message }
    }

    setTestResults(results)
    setIsTestingAPIs(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "authenticated":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "unauthenticated":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "loading":
        return <RefreshCw className="h-5 w-5 text-indigo-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getAPIStatusIcon = (result: any) => {
    if (!result) return <AlertCircle className="h-4 w-4 text-gray-400" />
    if (result.error) return <XCircle className="h-4 w-4 text-red-500" />
    if (result.ok) return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <Image src="/logo.svg" alt="dRAGon Logo" width={180} height={54} className="mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Authentication Flow Test</h1>
          <p className="text-gray-600">Test and verify the complete authentication and API integration</p>
        </div>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(status)}
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Session Status</h4>
                <Badge variant={status === "authenticated" ? "default" : "secondary"}>{status}</Badge>
              </div>

              {session && (
                <>
                  <div>
                    <h4 className="font-medium mb-2">User Info</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {session.user?.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {session.user?.email}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Access Token</h4>
                    <Badge variant={session.accessToken ? "default" : "destructive"}>
                      {session.accessToken ? "Present" : "Missing"}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Refresh Token</h4>
                    <Badge variant={session.refreshToken ? "default" : "destructive"}>
                      {session.refreshToken ? "Present" : "Missing"}
                    </Badge>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              {status === "unauthenticated" && <Button onClick={() => signIn("google")}>Sign In with Google</Button>}
              {status === "authenticated" && (
                <>
                  <Button onClick={() => signOut()}>Sign Out</Button>
                  <Button onClick={runAPITests} disabled={isTestingAPIs}>
                    {isTestingAPIs ? "Testing APIs..." : "Test APIs"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables Check */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span>GOOGLE_CLIENT_ID</span>
                <Badge variant={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "default" : "destructive"}>
                  {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>NEXTAUTH_SECRET</span>
                <Badge variant="default">Configured</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>GROQ_API_KEY</span>
                <Badge variant="default">Configured</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>NEXTAUTH_URL</span>
                <Badge variant="default">Auto-detected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Tests */}
        {session && Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>API Integration Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Calendar API Test */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAPIStatusIcon(testResults.calendar)}
                    <div>
                      <h4 className="font-medium">Google Calendar API</h4>
                      <p className="text-sm text-gray-600">Status: {testResults.calendar?.status || "Not tested"}</p>
                    </div>
                  </div>
                  {testResults.calendar?.data && (
                    <Badge variant="outline">{testResults.calendar.data.events?.length || 0} events</Badge>
                  )}
                </div>

                {/* Gmail API Test */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAPIStatusIcon(testResults.emails)}
                    <div>
                      <h4 className="font-medium">Gmail API</h4>
                      <p className="text-sm text-gray-600">Status: {testResults.emails?.status || "Not tested"}</p>
                    </div>
                  </div>
                  {testResults.emails?.data && (
                    <Badge variant="outline">{testResults.emails.data.emails?.length || 0} emails</Badge>
                  )}
                </div>

                {/* Chat API Test */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getAPIStatusIcon(testResults.chat)}
                    <div>
                      <h4 className="font-medium">Groq Chat API</h4>
                      <p className="text-sm text-gray-600">Status: {testResults.chat?.status || "Not tested"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Results Details */}
        {session && Object.keys(testResults).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Session Details */}
        {session && (
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(
                  {
                    ...session,
                    accessToken: session.accessToken ? "[REDACTED]" : null,
                    refreshToken: session.refreshToken ? "[REDACTED]" : null,
                  },
                  null,
                  2,
                )}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="text-center">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Back to Main App
          </Button>
        </div>
      </div>
    </div>
  )
}
