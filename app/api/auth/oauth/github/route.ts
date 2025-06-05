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

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)

    // Store state in cookies for verification in callback
    const response = NextResponse.redirect(
      `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        GITHUB_REDIRECT_URI,
      )}&scope=${encodeURIComponent(GITHUB_SCOPES.join(" "))}&state=${state}`,
    )

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
