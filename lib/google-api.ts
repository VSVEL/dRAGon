import type { EmailData, CalendarEvent } from "./types"

export class GoogleAPIClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async fetchEmails(maxResults = 10): Promise<EmailData[]> {
    try {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=is:unread OR is:important`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch emails")
      }

      const data = await response.json()
      const emails: EmailData[] = []

      for (const message of data.messages || []) {
        const emailResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })

        if (emailResponse.ok) {
          const emailData = await emailResponse.json()
          const headers = emailData.payload.headers

          emails.push({
            id: emailData.id,
            subject: headers.find((h: any) => h.name === "Subject")?.value || "No Subject",
            snippet: emailData.snippet,
            from: headers.find((h: any) => h.name === "From")?.value || "Unknown",
            date: headers.find((h: any) => h.name === "Date")?.value || "",
            unread: emailData.labelIds?.includes("UNREAD") || false,
          })
        }
      }

      return emails
    } catch (error) {
      console.error("Error fetching emails:", error)
      return []
    }
  }

  async fetchCalendarEvents(maxResults = 10): Promise<CalendarEvent[]> {
    try {
      const now = new Date().toISOString()
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("Failed to fetch calendar events")
      }

      const data = await response.json()

      return (
        data.items?.map((event: any) => ({
          id: event.id,
          summary: event.summary || "No Title",
          start: event.start,
          end: event.end,
          description: event.description,
          location: event.location,
          attendees: event.attendees,
        })) || []
      )
    } catch (error) {
      console.error("Error fetching calendar events:", error)
      return []
    }
  }
}
