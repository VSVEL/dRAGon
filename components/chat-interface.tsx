"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Send, Calendar, Mail, Plus, Crown } from "lucide-react"
import { useSession } from "next-auth/react"
import type { CalendarEvent, EmailData, DetectedEvent } from "@/lib/types"
import { EventCard } from "./event-card"
import { EmailCard } from "./email-card"
import { DetectedEventCard } from "./detected-event-card"
import { DragonLogo } from "./dragon-logo"
import { Badge } from "@/components/ui/badge"

interface ContextData {
  events: CalendarEvent[]
  emails: EmailData[]
  detectedEvents: DetectedEvent[]
  accountInfo: Record<string, { email: string; name: string; provider: string; isPrimary?: boolean }>
}

export default function ChatInterface() {
  const { data: session } = useSession()
  const [contextData, setContextData] = useState<ContextData>({
    events: [],
    emails: [],
    detectedEvents: [],
    accountInfo: {},
  })
  const [isLoadingContext, setIsLoadingContext] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    onFinish: () => {
      fetchContextData()
    },
  })

  const fetchContextData = async () => {
    if (!session?.user?.email) {
      return
    }

    setIsLoadingContext(true)
    try {
      // Use the multi-account context API
      const response = await fetch("/api/context-multi")

      if (response.ok) {
        const data = await response.json()

        const processedData: ContextData = {
          events: [],
          emails: [],
          detectedEvents: [],
          accountInfo: {},
        }

        // Process data from all accounts
        Object.entries(data.data).forEach(([key, value]: [string, any]) => {
          if (value.error) {
            console.error(`Error for ${key}:`, value.error)
            return
          }

          const [integrationId, accountEmail] = key.split("_", 2)
          processedData.accountInfo[key] = value.account

          switch (integrationId) {
            case "calendar":
              // Add account info to each event
              const eventsWithAccount = (value.data || []).map((event: CalendarEvent) => ({
                ...event,
                accountEmail,
                accountName: value.account.name,
                isPrimary: value.account.isPrimary,
              }))
              processedData.events.push(...eventsWithAccount)
              break
            case "gmail":
              // Add account info to each email
              const emailsWithAccount = (value.data || []).map((email: EmailData) => ({
                ...email,
                accountEmail,
                accountName: value.account.name,
                isPrimary: value.account.isPrimary,
              }))
              processedData.emails.push(...emailsWithAccount)
              break
          }
        })

        // Sort events by date
        processedData.events.sort((a, b) => {
          const dateA = new Date(a.start.dateTime || a.start.date || 0)
          const dateB = new Date(b.start.dateTime || b.start.date || 0)
          return dateA.getTime() - dateB.getTime()
        })

        // Sort emails by date (most recent first)
        processedData.emails.sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateB.getTime() - dateA.getTime()
        })

        // Simple event detection from emails across all accounts
        const detectedEvents: DetectedEvent[] = []
        processedData.emails.forEach((email: any) => {
          const text = `${email.subject} ${email.snippet}`.toLowerCase()
          if (text.includes("meeting") || text.includes("call") || text.includes("appointment")) {
            detectedEvents.push({
              title: email.subject,
              date: email.date,
              source: "email",
              sourceId: email.id,
              confidence: 0.7,
              description: email.snippet,
              accountEmail: email.accountEmail,
            })
          }
        })
        processedData.detectedEvents = detectedEvents

        setContextData(processedData)
        console.log("Loaded multi-account data:", {
          events: processedData.events.length,
          emails: processedData.emails.length,
          accounts: Object.keys(processedData.accountInfo).length,
        })
      }
    } catch (error) {
      console.error("Error fetching multi-account context data:", error)
    } finally {
      setIsLoadingContext(false)
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      fetchContextData()
    }
  }, [session?.user?.email])

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
        fetchContextData()
      }
    } catch (error) {
      console.error("Error adding event:", error)
    }
  }

  const getAccountBadge = (item: any) => {
    if (!item.accountEmail) return null

    return (
      <Badge variant="outline" className="text-xs flex items-center gap-1">
        {item.isPrimary && <Crown className="h-3 w-3" />}
        {item.accountEmail}
      </Badge>
    )
  }

  const getUniqueAccounts = () => {
    const accounts = new Set()
    Object.values(contextData.accountInfo).forEach((account) => {
      accounts.add(account.email)
    })
    return Array.from(accounts)
  }

  return (
    <div className="flex h-full">
      {/* Context Sidebar */}
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Today's Context</h2>

        {isLoadingContext && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto mb-2"></div>
            <p className="text-xs text-gray-600">Loading from all accounts...</p>
          </div>
        )}

        {/* Upcoming Events */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Upcoming Events ({contextData.events.length})
          </h3>
          <div className="space-y-2">
            {contextData.events.length === 0 && !isLoadingContext ? (
              <p className="text-xs text-gray-500">No upcoming events</p>
            ) : (
              contextData.events.slice(0, 5).map((event: any) => (
                <div key={`${event.id}_${event.accountEmail}`} className="space-y-1">
                  <EventCard event={event} compact />
                  {getAccountBadge(event)}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Emails */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Recent Emails ({contextData.emails.length})
          </h3>
          <div className="space-y-2">
            {contextData.emails.length === 0 && !isLoadingContext ? (
              <p className="text-xs text-gray-500">No recent emails</p>
            ) : (
              contextData.emails.slice(0, 5).map((email: any) => (
                <div key={`${email.id}_${email.accountEmail}`} className="space-y-1">
                  <EmailCard email={email} compact />
                  {getAccountBadge(email)}
                </div>
              ))
            )}
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
              {contextData.detectedEvents.map((event: any, index) => (
                <div key={index} className="space-y-1">
                  <DetectedEventCard event={event} onAddToCalendar={() => handleAddToCalendar(event)} />
                  {getAccountBadge(event)}
                </div>
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

          {/* Connected Accounts Info */}
          {getUniqueAccounts().length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {getUniqueAccounts().map((email: any) => (
                <Badge key={email} variant="outline" className="text-xs">
                  Google: {email}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <DragonLogo size="xl" className="mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Welcome to dRAGon!</h3>
                <p className="text-sm mb-4">
                  I can help you with your calendar, emails, and productivity tasks across all your Google accounts.
                </p>
                <div className="grid grid-cols-1 gap-2 max-w-md mx-auto text-left">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium">Try asking:</p>
                    <ul className="text-xs text-gray-600 mt-1 space-y-1">
                      <li>• "What meetings do I have today across all accounts?"</li>
                      <li>• "Show me emails from my work account"</li>
                      <li>• "Any conflicts between my personal and work calendars?"</li>
                      <li>• "Summarize emails from all my accounts"</li>
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
              placeholder="Ask me about your schedule, emails, or tasks across all accounts..."
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
