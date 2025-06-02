"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Calendar, Mail, Clock, MapPin } from "lucide-react"
import { useSession } from "next-auth/react"
import type { EmailData, CalendarEvent } from "@/lib/types"

interface ContextData {
  gmail?: EmailData[]
  calendar?: CalendarEvent[]
}

export default function ChatInterface() {
  const { data: session } = useSession()
  const [contextData, setContextData] = useState<ContextData>({})
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  // Fetch context data on component mount
  useEffect(() => {
    const fetchContext = async () => {
      try {
        const response = await fetch("/api/context")
        if (response.ok) {
          const data = await response.json()
          setContextData(data)
        } else {
          console.warn("Failed to fetch context data:", response.status)
          // Don't show error to user, just continue without context
        }
      } catch (error) {
        console.error("Error fetching context:", error)
        // Continue without context data
      }
    }

    if (session) {
      fetchContext()
    }
  }, [session])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar with context data */}
      <div className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Context</h2>

        {/* Calendar Events */}
        {contextData.calendar && contextData.calendar.length > 0 ? (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contextData.calendar.slice(0, 3).map((event) => (
                <div key={event.id} className="p-2 bg-blue-50 rounded text-xs">
                  <div className="font-medium">{event.summary}</div>
                  <div className="text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(event.start.dateTime || event.start.date || "")}
                  </div>
                  {event.location && (
                    <div className="text-gray-600 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Calendar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">No upcoming events</p>
            </CardContent>
          </Card>
        )}

        {/* Recent Emails */}
        {contextData.gmail && contextData.gmail.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Recent Emails
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contextData.gmail.slice(0, 3).map((email) => (
                <div key={email.id} className="p-2 bg-green-50 rounded text-xs">
                  <div className="font-medium truncate">{email.subject}</div>
                  <div className="text-gray-600 truncate">From: {email.from}</div>
                  <div className="text-gray-500 text-xs truncate">{email.snippet}</div>
                  {email.unread && <div className="text-blue-600 text-xs font-medium">Unread</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Gmail
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">No recent emails</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-semibold">AI Productivity Assistant</h1>
          <p className="text-gray-600 text-sm">Your context-aware productivity partner</p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <h3 className="text-lg font-medium mb-2">Welcome to your AI Assistant!</h3>
                <p className="text-sm">
                  I can help you with your emails, calendar, and productivity tasks. Try asking me about your upcoming
                  meetings or recent emails.
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
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
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input form */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me about your emails, calendar, or anything else..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
