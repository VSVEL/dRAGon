import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PluginManager } from "@/lib/plugins/plugin-manager"

export async function POST(request: NextRequest) {
  try {
    // Check if required environment variables are present
    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response(JSON.stringify({ error: "No session found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!session.accessToken) {
      return new Response(JSON.stringify({ error: "No access token available" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { messages } = await request.json()

    // Fetch context data from all enabled plugins
    const pluginManager = new PluginManager()
    const contextData = await pluginManager.fetchAllData(session.accessToken)
    const formattedContext = pluginManager.formatDataForAI(contextData)

    // Create enhanced system prompt with context
    const systemPrompt = `You are an AI productivity assistant with access to the user's personal data. You help with scheduling, email management, task prioritization, and general productivity.

Current Context Data:
${formattedContext}

Guidelines:
- Be proactive and helpful
- Suggest actionable next steps
- Identify conflicts, overlaps, or missed opportunities
- Maintain privacy and security
- Be concise but thorough
- When referencing emails or events, use specific details from the context

User's current time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
Current date/time: ${new Date().toISOString()}`

    const result = await streamText({
      model: groq("llama3-70b-8192"),
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in chat API:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
