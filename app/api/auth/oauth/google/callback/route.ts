import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { IntegrationService } from "@/lib/integration-service"

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLE_REDIRECT_URI = `${process.env.NEXTAUTH_URL}/api/auth/oauth/google/callback`

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }

    // Get the authorization code and state from the query parameters
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")

    // Verify state to prevent CSRF attacks
    const storedState = request.cookies.get("google_oauth_state")?.value
    const integration = request.cookies.get("google_oauth_integration")?.value || "google"

    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL("/integrations?error=invalid_state", request.url))
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const refreshToken = tokenData.refresh_token

    if (!accessToken) {
      throw new Error("No access token received")
    }

    // Get user information from Google
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data")
    }

    const userData = await userResponse.json()

    // Store the integration in the database
    const integrationService = IntegrationService.getInstance()
    await integrationService.loadUserIntegrations(session.user.email)

    const accountId = `google_${userData.id}`

    await integrationService.connectIntegration(session.user.email, integration, accountId, {
      provider: "google",
      email: userData.email,
      name: userData.name,
      accessToken,
      refreshToken,
    })

    // Clear the cookies
    const response = NextResponse.redirect(new URL("/integrations?success=google_connected", request.url))
    response.cookies.delete("google_oauth_state")
    response.cookies.delete("google_oauth_integration")

    return response
  } catch (error) {
    console.error("Google OAuth callback error:", error)
    return NextResponse.redirect(new URL("/integrations?error=oauth_callback_failed", request.url))
  }
}
