"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bug, ChevronDown, ChevronUp } from "lucide-react"

export function DebugPanel() {
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bug className="h-4 w-4" />
              Debug Info
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {isOpen && (
          <CardContent className="pt-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs">Status:</span>
              <Badge variant={status === "authenticated" ? "default" : "secondary"} className="text-xs">
                {status}
              </Badge>
            </div>
            {session && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs">User:</span>
                  <span className="text-xs truncate">{session.user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs">Token:</span>
                  <Badge variant={session.accessToken ? "default" : "destructive"} className="text-xs">
                    {session.accessToken ? "OK" : "Missing"}
                  </Badge>
                </div>
                {session.error && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs">Error:</span>
                    <Badge variant="destructive" className="text-xs">
                      {session.error}
                    </Badge>
                  </div>
                )}
              </>
            )}
            <Button size="sm" className="w-full text-xs" asChild>
              <a href="/test-auth" target="_blank" rel="noreferrer">
                Open Test Page
              </a>
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
