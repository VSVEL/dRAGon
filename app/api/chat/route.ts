import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { PluginManager } from "@/lib/plugins/plugin-manager"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages } = await request.json()
    const lastMessage = messages[messages.length - 1]

    // Fetch context data from all enabled plugins
    const pluginManager = new PluginManager()
    const contextData = await pluginManager.fetchAllData(session.accessToken as string)
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
    return new Response("Internal server error", { status: 500 })
  }
}
