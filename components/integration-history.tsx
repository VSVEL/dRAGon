"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, Github, MessageSquare, FileText, CheckSquare, Users } from "lucide-react"
import { format } from "date-fns"

interface IntegrationHistoryProps {
  isOpen: boolean
  onClose: () => void
  data: any
}

const iconMap: Record<string, any> = {
  google: Mail,
  "google-calendar": Calendar,
  gmail: Mail,
  github: Github,
  slack: MessageSquare,
  notion: FileText,
  linear: CheckSquare,
  microsoft: Users,
}

const actionColors: Record<string, string> = {
  connect: "bg-green-100 text-green-800",
  disconnect: "bg-red-100 text-red-800",
  enable: "bg-blue-100 text-blue-800",
  disable: "bg-gray-100 text-gray-800",
  sync: "bg-purple-100 text-purple-800",
  error: "bg-yellow-100 text-yellow-800",
}

export function IntegrationHistory({ isOpen, onClose, data }: IntegrationHistoryProps) {
  if (!data) return null

  const { stats, integrations } = data
  const logs = data.stats?.recentActivity || []

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Integration History</DialogTitle>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{stats?.totalIntegrations || 0}</div>
              <div className="text-xs text-gray-600">Total Integrations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold">{stats?.activeIntegrations || 0}</div>
              <div className="text-xs text-gray-600">Active Integrations</div>
            </CardContent>
          </Card>
        </div>

        {/* Provider Breakdown */}
        {stats?.providerBreakdown && Object.keys(stats.providerBreakdown).length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Provider Breakdown</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.providerBreakdown).map(([provider, count]) => {
                const IconComponent = iconMap[provider] || Mail
                return (
                  <Badge key={provider} variant="outline" className="flex items-center gap-1">
                    <IconComponent className="h-3 w-3" />
                    <span>
                      {provider}: {count}
                    </span>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-medium mb-2">Recent Activity</h3>
          {logs.length === 0 ? (
            <p className="text-sm text-gray-500">No recent activity</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log: any) => {
                const IconComponent = iconMap[log.integrationId] || Mail
                return (
                  <div key={log.id} className="p-2 border rounded-md flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-full bg-gray-100">
                        <IconComponent className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="font-medium">{log.integrationId}</div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(log.timestamp), "MMM d, yyyy h:mm a")}
                        </div>
                      </div>
                    </div>
                    <Badge className={actionColors[log.action] || "bg-gray-100"}>{log.action}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
