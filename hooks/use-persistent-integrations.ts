"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import type { StoredIntegration } from "@/lib/database/integration-storage"

export function usePersistentIntegrations() {
  const { data: session } = useSession()
  const [integrations, setIntegrations] = useState<StoredIntegration[]>([])
  const [stats, setStats] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRestored, setIsRestored] = useState(false)

  // Load integrations when session is available
  useEffect(() => {
    if (session?.user?.email) {
      loadIntegrations()
    }
  }, [session?.user?.email])

  const loadIntegrations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/integrations-v2")

      if (response.ok) {
        const data = await response.json()
        setIntegrations(data.data.integrations)
        setStats(data.data.stats)
        setIsRestored(data.data.restored)
      }
    } catch (error) {
      console.error("Error loading integrations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveIntegration = async (integration: any) => {
    try {
      const response = await fetch("/api/integrations-v2", {
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
      const response = await fetch("/api/integrations-v2", {
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
      const response = await fetch(`/api/integrations-v2?integrationId=${integrationId}`, {
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

  return {
    integrations,
    stats,
    isLoading,
    isRestored,
    saveIntegration,
    updateIntegration,
    removeIntegration,
    refreshIntegrations: loadIntegrations,
  }
}
