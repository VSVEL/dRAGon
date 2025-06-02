export interface User {
  id: string
  email: string
  name: string
  image?: string
}

export interface EmailData {
  id: string
  subject: string
  snippet: string
  from: string
  date: string
  unread: boolean
}

export interface CalendarEvent {
  id: string
  summary: string
  start: {
    dateTime?: string
    date?: string
  }
  end: {
    dateTime?: string
    date?: string
  }
  description?: string
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  data?: {
    emails?: EmailData[]
    events?: CalendarEvent[]
  }
}

export interface Integration {
  id: string
  name: string
  enabled: boolean
  scopes: string[]
  lastSync?: Date
}

export interface ContextData {
  emails: EmailData[]
  events: CalendarEvent[]
  integrations: Integration[]
}
