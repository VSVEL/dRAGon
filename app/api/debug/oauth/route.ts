import { NextResponse } from "next/server"

export async function GET() {
  try {
    const debugInfo = {
      environment: process.env.NODE_ENV,
      github: {
        clientId: !!process.env.GITHUB_CLIENT_ID,
        clientSecret: !!process.env.GITHUB_CLIENT_SECRET,
        redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/oauth/github/callback`,
      },
      nextauth: {
        url: !!process.env.NEXTAUTH_URL,
        secret: !!process.env.NEXTAUTH_SECRET,
      },
    }

    return NextResponse.json(debugInfo)
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: "Failed to get debug info" }, { status: 500 })
  }
}
