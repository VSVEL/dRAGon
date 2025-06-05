import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/auth/oauth/github/callback`
const GITHUB_SCOPES = ["repo", "user:email", "notifications", "read:org"]

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Validate required environment variables
    if (!GITHUB_CLIENT_ID) {
      console.error("GITHUB_CLIENT_ID is not configured")
      return NextResponse.redirect(new URL("/integrations?error=github_not_configured", request.url))
    }

    if (!process.env.NEXTAUTH_URL) {
      console.error("NEXTAUTH_URL is not configured")
      return NextResponse.redirect(new URL("/integrations?error=nextauth_url_missing", request.url))
    }

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)

    console.log("GitHub OAuth Configuration:")
    console.log("Client ID:", GITHUB_CLIENT_ID)
    console.log("Redirect URI:", GITHUB_REDIRECT_URI)
    console.log("Scopes:", GITHUB_SCOPES.join(" "))

    // Build the authorization URL
    const authUrl = new URL("https://github.com/login/oauth/authorize")
    authUrl.searchParams.set("client_id", GITHUB_CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", GITHUB_REDIRECT_URI)
    authUrl.searchParams.set("scope", GITHUB_SCOPES.join(" "))
    authUrl.searchParams.set("state", state)

    // Store state in cookies for verification in callback
    const response = NextResponse.redirect(authUrl.toString())

    // Set state cookie
    response.cookies.set("github_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    return response
  } catch (error) {
    console.error("GitHub OAuth error:", error)
    return NextResponse.redirect(new URL("/integrations?error=oauth_failed", request.url))
  }
}
