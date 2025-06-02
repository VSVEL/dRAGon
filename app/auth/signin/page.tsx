"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, Calendar, Mail, Shield } from "lucide-react"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/")
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      })

      if (result?.error) {
        console.error("Sign in error:", result.error)
        // Handle error appropriately
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">AI Productivity Assistant</CardTitle>
          <CardDescription>Connect your Google account to get started with your personal AI assistant</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>Access your Gmail for email insights</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>View your calendar events and schedule</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>Secure OAuth authentication</span>
            </div>
          </div>

          <Button onClick={handleSignIn} disabled={isLoading} className="w-full" size="lg">
            <Chrome className="h-5 w-5 mr-2" />
            {isLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            We only access the data you explicitly grant permission for and never store sensitive information.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
