import { Clock, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { EmailData } from "@/lib/types"

interface EmailCardProps {
  email: EmailData
  compact?: boolean
}

export function EmailCard({ email, compact = false }: EmailCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (compact) {
    return (
      <Card className={`p-3 ${email.unread ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm truncate flex-1">{email.subject}</div>
            {email.unread && (
              <Badge variant="secondary" className="text-xs">
                New
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-600 truncate">From: {email.from}</div>
          <div className="text-xs text-gray-500 truncate">{email.snippet}</div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">{email.subject}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>{email.from}</span>
              </div>
            </div>
            {email.unread && <Badge variant="secondary">Unread</Badge>}
          </div>

          <p className="text-sm text-gray-600">{email.snippet}</p>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatDate(email.date)}</span>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              View Email
            </Button>
            <Button variant="outline" size="sm">
              Reply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
