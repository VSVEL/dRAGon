"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import ChatInterface from "@/components/chat-interface"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"
import { LogOut, Settings } from "lucide-react"
import { DragonLogo } from "@/components/dragon-logo"
import Image from "next/image"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }

    // Handle session errors
    if (session?.error === "RefreshAccessTokenError") {
      // Force sign in to resolve the token error
      signOut({ callbackUrl: "/auth/signin" })
    }
  }, [status, router, session])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DragonLogo size="lg" className="mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading your assistant...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="dRAGon Logo" width={120} height={36} />
          </div>
          <div className="text-sm text-gray-600">
            Welcome back, <span className="font-medium">{session.user?.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/integrations")}>
            <Settings className="h-4 w-4 mr-2" />
            Integrations
          </Button>
          <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  )
}
