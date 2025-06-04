export interface User {
  id: string
  email: string
  name: string
  image?: string
  preferences?: UserPreferences
}

export interface UserPreferences {
  enabledIntegrations: string[]
  timezone: string
  workingHours: {
    start: string
    end: string
  }
  notifications: boolean
}

export interface EmailData {
  id: string
  subject: string
  snippet: string
  from: string
  date: string
  unread: boolean
  threadId: string
  labels: string[]
}

export interface CalendarEvent {
  id: string
  summary: string
  description?: string
  start: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  end: {
    dateTime?: string
    date?: string
    timeZone?: string
  }
  location?: string
  attendees?: Array<{
    email: string
    displayName?: string
    responseStatus?: string
  }>
  status?: string
  htmlLink?: string
}

export interface DetectedEvent {
  title: string
  date: string
  time?: string
  location?: string
  attendees?: string[]
  source: "email"
  sourceId: string
  confidence: number
  description?: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  metadata?: {
    events?: CalendarEvent[]
    emails?: EmailData[]
    detectedEvents?: DetectedEvent[]
    actions?: Array<{
      type: "add-to-calendar" | "view-email" | "reply-email"
      data: any
    }>
  }
}

export interface Integration {
  id: string
  name: string
  icon: string
  enabled: boolean
  connected: boolean
  scopes: string[]
  description: string
}

export interface AIContext {
  calendarEvents: CalendarEvent[]
  emails: EmailData[]
  userQuery: string
  timezone: string
  currentTime: string
}
