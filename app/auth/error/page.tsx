"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return "There is a problem with the server configuration."
      case "AccessDenied":
        return "You denied access to your Google account or didn't grant all required permissions."
      case "Verification":
        return "The verification token has expired or has already been used."
      case "OAuthSignin":
        return "Error in the OAuth signin process."
      case "OAuthCallback":
        return "Error in the OAuth callback process."
      case "OAuthCreateAccount":
        return "Error creating OAuth account."
      case "EmailCreateAccount":
        return "Error creating email account."
      case "Callback":
        return "Error in the OAuth callback handler."
      case "OAuthAccountNotLinked":
        return "The email on the account is already linked, but not with this OAuth account."
      case "EmailSignin":
        return "Error sending the email for sign in."
      case "CredentialsSignin":
        return "The sign in was incorrect. Check your credentials."
      case "SessionRequired":
        return "You must be signed in to access this page."
      default:
        return "An unexpected error occurred during authentication."
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image src="/logo.svg" alt="dRAGon Logo" width={180} height={54} className="mx-auto mb-4" />
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">Authentication Error</CardTitle>
          <CardDescription className="text-gray-600">{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">
              Please try signing in again. If the problem persists, contact support.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/auth/signin">Try Again</Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go to Home
              </Link>
            </Button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Error Code:</strong> {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
