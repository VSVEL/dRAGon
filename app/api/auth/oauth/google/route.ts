import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/auth/oauth/google/callback`

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Get the integration type from the query parameters
    const { searchParams } = new URL(request.url)
    const integration = searchParams.get("integration") || "google"

    // Define scopes based on the integration
    const scopes = ["openid", "email", "profile"]

    if (integration === "gmail" || integration === "google-mail") {
      scopes.push("https://www.googleapis.com/auth/gmail.readonly")
    }

    if (integration === "google-calendar") {
      scopes.push("https://www.googleapis.com/auth/calendar.readonly")
      scopes.push("https://www.googleapis.com/auth/calendar.events")
    }

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15)

    // Store state and integration in cookies for verification in callback
    const response = NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        GOOGLE_REDIRECT_URI,
      )}&response_type=code&scope=${encodeURIComponent(scopes.join(" "))}&access_type=offline&prompt=consent&state=${state}`,
    )

    // Set state cookie
    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    // Set integration cookie
    response.cookies.set("google_oauth_integration", integration, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10, // 10 minutes
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(new URL("/integrations?error=oauth_failed", request.url))
  }
}
