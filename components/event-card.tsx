import { Clock, MapPin, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { CalendarEvent } from "@/lib/types"

interface EventCardProps {
  event: CalendarEvent
  compact?: boolean
}

export function EventCard({ event, compact = false }: EventCardProps) {
  const startTime = event.start.dateTime || event.start.date
  const endTime = event.end.dateTime || event.end.date

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  if (compact) {
    return (
      <Card className="p-3 bg-blue-50 border-blue-200">
        <div className="space-y-1">
          <div className="font-medium text-sm truncate">{event.summary}</div>
          <div className="text-xs text-gray-600 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTime(startTime)}
          </div>
          {event.location && (
            <div className="text-xs text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold">{event.summary}</h3>
            {event.description && <p className="text-sm text-gray-600 mt-1">{event.description}</p>}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>
                {formatTime(startTime)} - {formatTime(endTime)}
              </span>
            </div>

            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{event.location}</span>
              </div>
            )}

            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span>{event.attendees.length} attendees</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                View in Calendar
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
