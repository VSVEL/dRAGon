import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Calendar, Mail, MessageSquare, Github, FileText, CheckSquare, Users, Zap } from "lucide-react"
import type { Integration } from "@/lib/types"

const availableIntegrations: Integration[] = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: "Calendar",
    enabled: true,
    connected: true,
    scopes: ["calendar.readonly", "calendar.events"],
    description: "Access your calendar events and create new ones",
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: "Mail",
    enabled: true,
    connected: true,
    scopes: ["gmail.readonly"],
    description: "Read and analyze your email messages",
  },
  {
    id: "slack",
    name: "Slack",
    icon: "MessageSquare",
    enabled: false,
    connected: false,
    scopes: ["channels:read", "chat:write"],
    description: "Access your Slack messages and channels",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "Github",
    enabled: false,
    connected: false,
    scopes: ["repo", "notifications"],
    description: "Monitor your repositories and pull requests",
  },
  {
    id: "notion",
    name: "Notion",
    icon: "FileText",
    enabled: false,
    connected: false,
    scopes: ["read_content", "insert_content"],
    description: "Access your Notion pages and databases",
  },
  {
    id: "linear",
    name: "Linear",
    icon: "CheckSquare",
    enabled: false,
    connected: false,
    scopes: ["read", "write"],
    description: "Manage your Linear issues and projects",
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    icon: "Users",
    enabled: false,
    connected: false,
    scopes: ["chat.read", "calendars.read"],
    description: "Access your Teams messages and meetings",
  },
]

const iconMap = {
  Calendar,
  Mail,
  MessageSquare,
  Github,
  FileText,
  CheckSquare,
  Users,
  Zap,
}

export function IntegrationsPanel() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Integrations</h2>
        <p className="text-gray-600">Connect your favorite tools to enhance your AI assistant</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableIntegrations.map((integration) => {
          const IconComponent = iconMap[integration.icon as keyof typeof iconMap]

          return (
            <Card key={integration.id} className={integration.connected ? "border-green-200" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${integration.connected ? "bg-green-100" : "bg-gray-100"}`}>
                      <IconComponent
                        className={`h-5 w-5 ${integration.connected ? "text-green-600" : "text-gray-600"}`}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={integration.connected ? "default" : "secondary"}>
                          {integration.connected ? "Connected" : "Not Connected"}
                        </Badge>
                        {integration.enabled && <Badge variant="outline">Enabled</Badge>}
                      </div>
                    </div>
                  </div>
                  <Switch checked={integration.enabled} disabled={!integration.connected} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{integration.description}</p>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">Scopes: {integration.scopes.join(", ")}</div>
                  <Button
                    variant={integration.connected ? "outline" : "default"}
                    size="sm"
                    disabled={integration.connected}
                  >
                    {integration.connected ? "Connected" : "Connect"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6 text-center">
          <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="font-semibold mb-2">More Integrations Coming Soon</h3>
          <p className="text-sm text-gray-600 mb-4">
            We're working on adding more integrations to make your AI assistant even more powerful.
          </p>
          <Button variant="outline">Request Integration</Button>
        </CardContent>
      </Card>
    </div>
  )
}
