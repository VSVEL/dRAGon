import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"
import type { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { GoogleAPIClient } from "@/lib/google-api"
import { buildAIPrompt } from "@/lib/ai-utils"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages } = await request.json()
    const lastMessage = messages[messages.length - 1]

    // Fetch fresh data from Google APIs
    const client = new GoogleAPIClient(session.accessToken)
    const [calendarEvents, emails] = await Promise.all([client.fetchCalendarEvents(), client.fetchEmails()])

    // Build AI context
    const context = {
      calendarEvents,
      emails,
      userQuery: lastMessage.content,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currentTime: new Date().toISOString(),
    }

    const systemPrompt = buildAIPrompt(context)

    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      system: systemPrompt,
      messages: messages,
      temperature: 0.7,
      maxTokens: 1500,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
