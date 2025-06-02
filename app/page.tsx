"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import ChatInterface from "@/components/chat-interface"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { LogOut, Settings } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your assistant...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Top navigation */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="text-gray-600">Welcome back, </span>
            <span className="font-medium">{session.user?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main chat interface */}
      <div className="flex-1">
        <ChatInterface />
      </div>
    </div>
  )
}
