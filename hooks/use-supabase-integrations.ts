"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { Integration } from "@/lib/supabase/integration-service"

export function useSupabaseIntegrations() {
  const { data: session } = useSession()
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [stats, setStats] = useState<any>({})
  const [analytics, setAnalytics] = useState<any>({})
  const [userSession, setUserSession] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRestored, setIsRestored] = useState(false)
  const [welcomeMessage, setWelcomeMessage] = useState("")

  // Load integrations when session is available
  useEffect(() => {
    if (session?.user?.email) {
      loadIntegrations()
    }
  }, [session?.user?.email])

  const loadIntegrations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/integrations-supabase")

      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.data.integrations)
        setStats(data.data.stats)
        setAnalytics(data.data.analytics)
        setUserSession(data.data.session)
        setIsRestored(data.data.restored)
        setWelcomeMessage(data.message)
      }
    } catch (error) {
      console.error("Error loading integrations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveIntegration = async (integration: any) => {
    try {
      const response = await fetch("/api/integrations-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integration }),
      })

      if (response.ok) {
        await loadIntegrations() // Refresh the list
        return true
      }
      return false
    } catch (error) {
      console.error("Error saving integration:", error)
      return false
    }
  }

  const updateIntegration = async (integrationId: string, updates: any) => {
    try {
      const response = await fetch("/api/integrations-supabase", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId, updates }),
      })

      if (response.ok) {
        await loadIntegrations() // Refresh the list
        return true
      }
      return false
    } catch (error) {
      console.error("Error updating integration:", error)
      return false
    }
  }

  const removeIntegration = async (integrationId: string) => {
    try {
      const response = await fetch(`/api/integrations-supabase?integrationId=${integrationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadIntegrations() // Refresh the list
        return true
      }
      return false
    } catch (error) {
      console.error("Error removing integration:", error)
      return false
    }
  }

  const toggleIntegration = async (integrationId: string, enabled: boolean) => {
    return await updateIntegration(integrationId, { is_enabled: enabled })
  }

  return {
    integrations,
    stats,
    analytics,
    userSession,
    isLoading,
    isRestored,
    welcomeMessage,
    saveIntegration,
    updateIntegration,
    removeIntegration,
    toggleIntegration,
    refreshIntegrations: loadIntegrations,
  }
}
