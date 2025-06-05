import { type NextRequest, NextResponse } from "next/server"
import { MultiGoogleAuthManager } from "@/lib/multi-google-auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      console.error("Google OAuth error:", error)
      return NextResponse.redirect("/integrations?error=oauth_denied")
    }

    if (!code || !state) {
      return NextResponse.redirect("/integrations?error=missing_params")
    }

    const stateData = JSON.parse(state)
    const { userId, returnUrl, action } = stateData

    if (action !== "add_account") {
      return NextResponse.redirect("/integrations?error=invalid_action")
    }

    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/add-account/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens")
    }

    const tokens = await tokenResponse.json()

    // Get user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    })

    if (!userResponse.ok) {
      throw new Error("Failed to fetch user info")
    }

    const userInfo = await userResponse.json()

    // Add account to multi-account manager
    const authManager = MultiGoogleAuthManager.getInstance()
    await authManager.loadAccounts(userId)

    const newAccount = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      isActive: true,
      isPrimary: false, // Additional accounts are never primary
      connectedAt: new Date(),
    }

    authManager.addAccount(newAccount, userId)

    return NextResponse.redirect(`${returnUrl}?success=account_added&email=${encodeURIComponent(userInfo.email)}`)
  } catch (error) {
    console.error("Error in Google add account callback:", error)
    return NextResponse.redirect("/integrations?error=callback_failed")
  }
}
