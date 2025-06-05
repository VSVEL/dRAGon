import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.redirect("/auth/signin")
    }

    // Store the current session info to restore after adding account
    const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/integrations"

    // Google OAuth URL with account selection forced
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID!)
    googleAuthUrl.searchParams.set("redirect_uri", `${process.env.NEXTAUTH_URL}/api/auth/google/add-account/callback`)
    googleAuthUrl.searchParams.set("response_type", "code")
    googleAuthUrl.searchParams.set(
      "scope",
      [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
      ].join(" "),
    )
    googleAuthUrl.searchParams.set("access_type", "offline")
    googleAuthUrl.searchParams.set("prompt", "select_account consent") // Force account selection
    googleAuthUrl.searchParams.set(
      "state",
      JSON.stringify({
        userId: session.user.email,
        returnUrl,
        action: "add_account",
      }),
    )

    return NextResponse.redirect(googleAuthUrl.toString())
  } catch (error) {
    console.error("Error initiating Google account addition:", error)
    return NextResponse.redirect("/integrations?error=auth_failed")
  }
}
