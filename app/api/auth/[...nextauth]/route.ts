import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = async (req: Request, res: Response) => {
  try {
    const nextAuthHandler = NextAuth(authOptions)
    // @ts-expect-error
    return await nextAuthHandler(req, res)
  } catch (error: any) {
    console.error("NextAuth configuration error:", error)

    // Fallback handler
    const fallbackHandler = async (request: Request) => {
      return new Response(
        JSON.stringify({
          error: "Authentication configuration error",
          details: process.env.NODE_ENV === "development" ? error.message : "Please contact support",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    return fallbackHandler(req)
  }
}

export { handler as GET, handler as POST }
