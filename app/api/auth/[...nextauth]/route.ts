import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Create the handler with proper error handling
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
