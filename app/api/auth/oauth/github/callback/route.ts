import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { IntegrationService } from "@/lib/integration-service"

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET

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
    const storedState = request.cookies.get("github_oauth_state")?.value

    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL("/integrations?error=invalid_state", request.url))
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/oauth/github/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    if (!accessToken) {
      throw new Error("No access token received")
    }

    // Get user information from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data")
    }

    const userData = await userResponse.json()

    // Get user email from GitHub
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    })

    if (!emailResponse.ok) {
      throw new Error("Failed to fetch user emails")
    }

    const emailData = await emailResponse.json()
    const primaryEmail = emailData.find((email: any) => email.primary)?.email || emailData[0]?.email

    if (!primaryEmail) {
      throw new Error("No email found for GitHub user")
    }

    // Store the integration in the database
    const integrationService = IntegrationService.getInstance()
    await integrationService.loadUserIntegrations(session.user.email)

    const accountId = `github_${userData.id}`

    await integrationService.connectIntegration(session.user.email, "github", accountId, {
      provider: "github",
      email: primaryEmail,
      name: userData.name || userData.login,
      accessToken,
    })

    // Clear the state cookie
    const response = NextResponse.redirect(new URL("/integrations?success=github_connected", request.url))
    response.cookies.delete("github_oauth_state")

    return response
  } catch (error) {
    console.error("GitHub OAuth callback error:", error)
    return NextResponse.redirect(new URL("/integrations?error=oauth_callback_failed", request.url))
  }
}
