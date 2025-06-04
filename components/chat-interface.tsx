"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Calendar, Mail, Plus } from "lucide-react"
import { useSession } from "next-auth/react"
import type { CalendarEvent, EmailData, DetectedEvent } from "@/lib/types"
import { EventCard } from "./event-card"
import { EmailCard } from "./email-card"
import { DetectedEventCard } from "./detected-event-card"
import { DragonLogo } from "./dragon-logo"

interface ContextData {
  events: CalendarEvent[]
  emails: EmailData[]
  detectedEvents: DetectedEvent[]
}

export default function ChatInterface() {
  const { data: session } = useSession()
  const [contextData, setContextData] = useState<ContextData>({
    events: [],
    emails: [],
    detectedEvents: [],
  })
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onFinish: () => {
      // Refresh context data after AI response
      fetchContextData()
    },
  })

  const fetchContextData = async () => {
    try {
      const [calendarRes, emailsRes] = await Promise.all([fetch("/api/calendar"), fetch("/api/emails")])

      if (calendarRes.ok && emailsRes.ok) {
        const [calendarData, emailsData] = await Promise.all([calendarRes.json(), emailsRes.json()])

        // Simple event detection (in production, use more sophisticated NLP)
        const detectedEvents: DetectedEvent[] = []
        emailsData.emails?.forEach((email: EmailData) => {
          const text = `${email.subject} ${email.snippet}`.toLowerCase()
          if (text.includes("meeting") || text.includes("call") || text.includes("appointment")) {
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

        setContextData({
          events: calendarData.events || [],
          emails: emailsData.emails || [],
          detectedEvents,
        })
      }
    } catch (error) {
      console.error("Error fetching context data:", error)
    }
  }

  useEffect(() => {
    if (session) {
      fetchContextData()
    }
  }, [session])

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleAddToCalendar = async (detectedEvent: DetectedEvent) => {
    try {
      const eventData = {
        summary: detectedEvent.title,
        description: detectedEvent.description,
        start: {
          dateTime: new Date(detectedEvent.date).toISOString(),
        },
        end: {
          dateTime: new Date(new Date(detectedEvent.date).getTime() + 60 * 60 * 1000).toISOString(),
        },
      }

      const response = await fetch("/api/add-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        fetchContextData() // Refresh data
      }
    } catch (error) {
      console.error("Error adding event:", error)
    }
  }

  return (
    <div className="flex h-full">
      {/* Context Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Today's Context</h2>

        {/* Upcoming Events */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Events ({contextData.events.length})
          </h3>
          <div className="space-y-2">
            {contextData.events.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} compact />
            ))}
          </div>
        </div>

        {/* Recent Emails */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Recent Emails ({contextData.emails.length})
          </h3>
          <div className="space-y-2">
            {contextData.emails.slice(0, 3).map((email) => (
              <EmailCard key={email.id} email={email} compact />
            ))}
          </div>
        </div>

        {/* Detected Events */}
        {contextData.detectedEvents.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Detected Events ({contextData.detectedEvents.length})
            </h3>
            <div className="space-y-2">
              {contextData.detectedEvents.map((event, index) => (
                <DetectedEventCard key={index} event={event} onAddToCalendar={() => handleAddToCalendar(event)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold">dRAGon Assistant</h1>
          <p className="text-gray-600 text-sm">Ask me about your schedule, emails, or productivity tasks</p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <DragonLogo size="xl" className="mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Welcome to dRAGon!</h3>
                <p className="text-sm mb-4">I can help you with your calendar, emails, and productivity tasks.</p>
                <div className="grid grid-cols-1 gap-2 max-w-md mx-auto text-left">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium">Try asking:</p>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>• "What meetings do I have today?"</li>
                      <li>• "Summarize my morning emails"</li>
                      <li>• "Any meetings missing from my calendar?"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <DragonLogo size="sm" variant="simple" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ""} />
                    <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <DragonLogo size="sm" variant="simple" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Form */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me about your schedule, emails, or tasks..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
