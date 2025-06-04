import type { AIContext, DetectedEvent, CalendarEvent, EmailData } from "./types"

export function buildAIPrompt(context: AIContext): string {
  const { calendarEvents, emails, userQuery, timezone, currentTime } = context

  const calendarSummary =
    calendarEvents.length > 0
      ? calendarEvents
          .map((event) => {
            const startTime = event.start.dateTime || event.start.date
            return `- ${event.summary} (${startTime}${event.location ? `, ${event.location}` : ""})`
          })
          .join("\n")
      : "No upcoming calendar events found."

  const emailSummary =
    emails.length > 0
      ? emails
          .slice(0, 10)
          .map((email) => `- From: ${email.from}\n  Subject: ${email.subject}\n  Snippet: ${email.snippet}`)
          .join("\n\n")
      : "No recent emails found."

  return `You are an AI productivity assistant. Analyze the user's calendar and emails to provide helpful insights and suggestions.

Current Context:
- Current time: ${currentTime}
- Timezone: ${timezone}
- User query: "${userQuery}"

Calendar Events (next 30 days):
${calendarSummary}

Recent Emails (last 20):
${emailSummary}

Instructions:
1. Answer the user's query based on the provided context
2. Identify any potential meetings or events mentioned in emails that might not be in the calendar
3. Suggest actionable next steps
4. Be concise but thorough
5. If you detect events in emails that aren't in the calendar, mention them specifically
6. Focus on productivity and time management insights

Respond in a helpful, professional tone.`
}

export function parseDetectedEvents(aiResponse: string, emails: EmailData[]): DetectedEvent[] {
  // This is a simplified parser - in production, you'd want more sophisticated NLP
  const detectedEvents: DetectedEvent[] = []

  // Look for patterns like "meeting", "call", "appointment" in email subjects and snippets
  emails.forEach((email) => {
    const text = `${email.subject} ${email.snippet}`.toLowerCase()

    // Simple pattern matching for meeting detection
    const meetingPatterns = [
      /meeting.*(?:on|at)\s+([^,\n]+)/i,
      /call.*(?:on|at)\s+([^,\n]+)/i,
      /appointment.*(?:on|at)\s+([^,\n]+)/i,
      /interview.*(?:on|at)\s+([^,\n]+)/i,
    ]

    meetingPatterns.forEach((pattern) => {
      const match = text.match(pattern)
      if (match) {
        detectedEvents.push({
          title: email.subject,
          date: email.date,
          source: "email",
          sourceId: email.id,
          confidence: 0.7,
          description: email.snippet,
        })
      }
    })
  })

  return detectedEvents
}

export function formatEventsForAI(events: CalendarEvent[]): string {
  if (events.length === 0) return "No calendar events found."

  return events
    .map((event) => {
      const start = event.start.dateTime || event.start.date
      const end = event.end.dateTime || event.end.date
      return `Event: ${event.summary}
Time: ${start} to ${end}
${event.location ? `Location: ${event.location}` : ""}
${event.description ? `Description: ${event.description}` : ""}
${event.attendees?.length ? `Attendees: ${event.attendees.map((a) => a.email).join(", ")}` : ""}`
    })
    .join("\n\n")
}

export function formatEmailsForAI(emails: EmailData[]): string {
  if (emails.length === 0) return "No emails found."

  return emails
    .map(
      (email) =>
        `From: ${email.from}
Subject: ${email.subject}
Date: ${email.date}
Snippet: ${email.snippet}
Status: ${email.unread ? "Unread" : "Read"}`,
    )
    .join("\n\n")
}
