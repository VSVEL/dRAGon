import type { EmailData, CalendarEvent } from "./types"

export class GoogleAPIClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async fetchEmails(
    maxResults = 20,
    query = "in:inbox",
    includeSpam = false,
    includeTrash = false,
  ): Promise<EmailData[]> {
    try {
      // Build the query with additional parameters
      let searchQuery = query
      if (!includeSpam) {
        searchQuery += " -in:spam"
      }
      if (!includeTrash) {
        searchQuery += " -in:trash"
      }

      console.log("Gmail API: Using query:", searchQuery)

      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Gmail API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const emails: EmailData[] = []

      console.log("Gmail API: Found", data.messages?.length || 0, "message IDs")

      // Fetch details for each message (this is where quota is used heavily)
      for (const message of data.messages || []) {
        try {
          const emailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          })

          if (emailResponse.ok) {
            const emailData = await emailResponse.json()
            const headers = emailData.payload?.headers || []

            emails.push({
              id: emailData.id,
              subject: headers.find((h: any) => h.name === "Subject")?.value || "No Subject",
              snippet: emailData.snippet || "",
              from: headers.find((h: any) => h.name === "From")?.value || "Unknown",
              date: headers.find((h: any) => h.name === "Date")?.value || "",
              unread: emailData.labelIds?.includes("UNREAD") || false,
              threadId: emailData.threadId,
              labels: emailData.labelIds || [],
            })
          }
        } catch (emailError) {
          console.warn(`Failed to fetch email ${message.id}:`, emailError)
        }
      }

      return emails
    } catch (error) {
      console.error("Error fetching emails:", error)
      return []
    }
  }

  async fetchCalendarEvents(maxResults = 20): Promise<CalendarEvent[]> {
    try {
      const now = new Date().toISOString()
      const endTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&timeMax=${endTime}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.status}`)
      }

      const data = await response.json()

      return (
        data.items?.map((event: any) => ({
          id: event.id,
          summary: event.summary || "No Title",
          description: event.description || "",
          start: event.start,
          end: event.end,
          location: event.location || "",
          attendees: event.attendees || [],
          status: event.status,
          htmlLink: event.htmlLink,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      return []
    }
  }

  async createCalendarEvent(event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    try {
      const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      })

      if (!response.ok) {
        throw new Error(`Calendar API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Error creating calendar event:", error)
      return null
    }
  }
}
