import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { IntegrationService } from "@/lib/integration-service"

// Slack OAuth configuration
const SLACK_CLIENT_ID = process.env.SLACK_CLIENT_ID
const SLACK_CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET

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
    const storedState = request.cookies.get("slack_oauth_state")?.value
    if (!code || !state || !storedState || state !== storedState) {
      return NextResponse.redirect(new URL("/integrations?error=invalid_state", request.url))
    }

    // Exchange the code for an access token
    const tokenResponse = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID || "",
        client_secret: SLACK_CLIENT_SECRET || "",
        code: code || "",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/oauth/slack/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token
    const authedUser = tokenData.authed_user
    const team = tokenData.team

    if (!accessToken || !authedUser) {
      throw new Error("No access token or user info received from Slack")
    }

    // Optionally, fetch user info from Slack
    // const userResponse = await fetch("https://slack.com/api/users.info?user=" + authedUser.id, {
    //   headers: { Authorization: `Bearer ${accessToken}` },
    // })
    // const userData = await userResponse.json()

    // Store the integration in the database
    const integrationService = IntegrationService.getInstance()
    await integrationService.loadUserIntegrations(session.user.email)

    const accountId = `slack_${authedUser.id}`
    await integrationService.connectIntegration(session.user.email, "slack", accountId, {
      provider: "slack",
      accessToken,
      slackUserId: authedUser.id,
      slackTeamId: team?.id,
      slackTeamName: team?.name,
    } as any)

    // Clear the state cookie
    const response = NextResponse.redirect(new URL("/integrations?success=slack_connected", request.url))
    response.cookies.delete("slack_oauth_state")
    return response
  } catch (error) {
    console.error("Slack OAuth callback error:", error)
    return NextResponse.redirect(new URL("/integrations?error=oauth_callback_failed", request.url))
  }
}
