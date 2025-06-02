import { BasePlugin } from "./base-plugin"
import { GoogleAPIClient } from "../google-api"
import type { CalendarEvent } from "../types"

export class CalendarPlugin extends BasePlugin {
  id = "calendar"
  name = "Google Calendar"
  scopes = ["https://www.googleapis.com/auth/calendar.readonly"]

  isEnabled(): boolean {
    return true
  }

  async fetchData(accessToken: string): Promise<CalendarEvent[]> {
    const client = new GoogleAPIClient(accessToken)
    return await client.fetchCalendarEvents()
  }

  formatForAI(events: CalendarEvent[]): string {
    if (!events.length) return "No upcoming calendar events found."

    return `Upcoming calendar events (${events.length} items):
${events
  .map((event) => {
    const startTime = event.start.dateTime || event.start.date
    const endTime = event.end.dateTime || event.end.date
    return `- ${event.summary}
  Time: ${startTime} to ${endTime}
  ${event.location ? `Location: ${event.location}` : ""}
  ${event.description ? `Description: ${event.description}` : ""}`
  })
  .join("\n\n")}`
  }
}
