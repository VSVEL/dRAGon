"use client"

import { Plus, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { DetectedEvent } from "@/lib/types"

interface DetectedEventCardProps {
  event: DetectedEvent
  onAddToCalendar: () => void
}

export function DetectedEventCard({ event, onAddToCalendar }: DetectedEventCardProps) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="p-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="font-medium text-sm">Potential Meeting</span>
              </div>
              <h4 className="font-semibold text-sm mt-1">{event.title}</h4>
            </div>
            <Badge variant="outline" className="text-xs">
              {Math.round(event.confidence * 100)}% match
            </Badge>
          </div>

          {event.description && <p className="text-xs text-gray-600 truncate">{event.description}</p>}

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">From email</span>
            <Button size="sm" onClick={onAddToCalendar} className="h-7 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Add to Calendar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
